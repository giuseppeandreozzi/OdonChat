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

		public Dictionary<string, string> chats;
		public List<Chat> messages;
		public ChatModel(IMongoDatabase db) {
			_users = db.GetCollection<User>("Users");
			_chats = db.GetCollection<Chat>("Chat");

			messages = new List<Chat>();
		}

		public void OnGet() {
			//gettings the chat id of the user
			chats = _users.AsQueryable().Where(u => u.id.ToString() == User.FindFirst("id").Value).Select(u => u.chats).FirstOrDefault();

			if (chats == null)
				return;

			//getting the content of messages of the user
			foreach (var item in chats) {
				messages.Add(_chats.AsQueryable().Where(c => c.id.ToString() == item.Value).FirstOrDefault());
			}
		}
	}
}
