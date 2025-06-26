using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;

namespace OdonChat.Hubs {
	[Authorize]
	public class ChatHub : Hub {
		private IMongoCollection<OdonChat.model.User> _users;

		public ChatHub(IMongoDatabase db) {
			_users = db.GetCollection<OdonChat.model.User>("Users");
		}
		public async Task SearchUser(string user) {
			OdonChat.model.User user2 = _users.AsQueryable().Where(u => u.username == user).FirstOrDefault();


			await Clients.User(Context.User.FindFirst("username").Value).SendAsync("ReceiveUser", (user2 == null) ? null : new {
				username = user2.username
			});
		}
	}

	public class UsernameBasedUserIdProvider : IUserIdProvider {
		public virtual string GetUserId(HubConnectionContext connection) {
			return connection.User?.FindFirst("username")?.Value!;
		}
	}
}
