using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using OdonChat.model;
using System.Security.Claims;

namespace OdonChat.Hubs {
	[Authorize]
	public class ChatHub : Hub {
		private IMongoCollection<OdonChat.model.User> _users;
		private IMongoCollection<OdonChat.model.Chat> _chat;

		public ChatHub(IMongoDatabase db) {
			_users = db.GetCollection<OdonChat.model.User>("Users");
			_chat = db.GetCollection<OdonChat.model.Chat>("Chat");
		}
		public async Task SearchUser(string user) {
			OdonChat.model.User user2 = _users.AsQueryable().Where(u => u.username == user).FirstOrDefault();


			await Clients.User(Context.User.FindFirst("username").Value).SendAsync("ReceiveUser", (user2 == null) ? null : new {
				username = user2.username,
				id = user2.id.ToString(),
				avatar = Convert.ToBase64String(user2.image)
			});
		}

		public async Task SendMessage(string usernameTo, string textMessage, string timeMessage) {
			OdonChat.model.User userFrom = _users.AsQueryable().Where(u => u.username == Context.User.FindFirst("username").Value).FirstOrDefault();
			Chat chat = new Chat();

			if (userFrom.chats != null && userFrom.chats.ContainsKey(usernameTo)) {
				string idChat = userFrom.chats[usernameTo];
				chat = _chat.AsQueryable().Where(c => c.id.ToString() == idChat).FirstOrDefault();
				chat.messages.Add(new Message {
					userFrom = userFrom.username,
					text = textMessage,
					time = DateTime.Parse(timeMessage)
				});

				//Updating on db
				var filter = Builders<Chat>.Filter.Eq(c => c.id, chat.id);
				var update = Builders<Chat>.Update.Set(c => c.messages, chat.messages);
				_chat.UpdateOne(filter, update);
			} else {
				var messages = new List<Message>();
				messages.Add(new Message {
					userFrom = userFrom.username,
					text = textMessage,
					time = DateTime.Parse(timeMessage)
				});
				chat.messages = messages;
				chat.id = ObjectId.GenerateNewId();

				//inserting to db
				_chat.InsertOne(chat);

				//set the chat on the users
				OdonChat.model.User userTo = _users.AsQueryable().Where(u => u.username == usernameTo).FirstOrDefault();
				userTo.chats.Add(userFrom.username, chat.id.ToString());
				userFrom.chats.Add(userTo.username, chat.id.ToString());

				var filter = Builders<User>.Filter.Eq(u => u.id, userTo.id);
				var update = Builders<User>.Update.Set(c => c.chats, userTo.chats);
				_users.UpdateOne(filter, update);

				filter = Builders<User>.Filter.Eq(u => u.id, userFrom.id);
				update = Builders<User>.Update.Set(c => c.chats, userFrom.chats);
				_users.UpdateOne(filter, update);
			}

			await Clients.User(usernameTo).SendAsync("ReceiveMessage", new {
				message = textMessage,
				chatId = chat.id.ToString(),
				usernameFrom = userFrom.username,
				userFromId = userFrom.id.ToString(),
				avatar = Convert.ToBase64String(userFrom.image)
			});

		} //end SendMessage


	}

	public class UsernameBasedUserIdProvider : IUserIdProvider {
		public virtual string GetUserId(HubConnectionContext connection) {
			return connection.User?.FindFirst("username")?.Value!;
		}
	}
}
