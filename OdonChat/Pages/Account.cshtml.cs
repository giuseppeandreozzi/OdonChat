using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MongoDB.Driver;
using OdonChat.model;

namespace OdonChat.Pages {
	[Authorize]
	public class AccountModel : PageModel {
		private IMongoCollection<User> _usersCollection;
		public User? user;
		public AccountModel(IMongoDatabase db) {
			_usersCollection = db.GetCollection<User>("Users");
		}

		public void OnGet() {
			var users = _usersCollection.AsQueryable<User>();
			user = users.Where(user => user.username == User.FindFirst("username").Value).FirstOrDefault();

		}
	}
}
