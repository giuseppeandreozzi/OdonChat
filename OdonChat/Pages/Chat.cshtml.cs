using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MongoDB.Driver;
using OdonChat.model;

namespace OdonChat.Pages {
	[Authorize]
	public class ChatModel : PageModel {
		private IMongoCollection<User> _users;
		private IMongoCollection<Chat> _chats;

		public List<ChatData> chat;
		public List<Chat> messages;
		public byte [] avatar;
		public ChatModel(IMongoDatabase db) {
			_users = db.GetCollection<User>("Users");
			_chats = db.GetCollection<Chat>("Chat");

			messages = new List<Chat>();
		}

		public void OnGet() {
			chat = new List<ChatData>();
			var user = _users.AsQueryable().Where(u => u.id.ToString() == User.FindFirst("id").Value).FirstOrDefault();
			avatar = user.image;

			//gettings the chat id of the user
			Dictionary<string, string> chats = user.chats;

			if (chats == null)
				return;

			//getting the content of messages of the user
			foreach (var item in chats) {
				byte[] userToAvatar = _users.AsQueryable().Where(u => u.username == item.Key).Select(u => u.image).FirstOrDefault();
				chat.Add(new ChatData(item.Key, item.Value, userToAvatar));
				messages.Add(_chats.AsQueryable().Where(c => c.id.ToString() == item.Value).FirstOrDefault());
			}
		}
	}

	public record ChatData(string userTo, string idChat, byte[] avatar);
}
