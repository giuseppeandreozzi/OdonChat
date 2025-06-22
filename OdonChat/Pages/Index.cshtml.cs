using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MongoDB.Driver;
using OdonChat.model;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace OdonChat.Pages {
	public class IndexModel : PageModel {
		private readonly ILogger<IndexModel> _logger;
		private IMongoCollection<User> _usersCollection;
		PasswordHasher<User> hasher;
		public IndexModel(ILogger<IndexModel> logger, IMongoDatabase db) {
			_logger = logger;
			_usersCollection = db.GetCollection<User>("Users");
			hasher = new PasswordHasher<User>();
		}

		public IActionResult OnGet() {
			if (User.Identity.IsAuthenticated) {
				return new RedirectToPageResult("Chat");
			} else {
				return Page();
			}
		}
		public async Task<IActionResult> OnPostLogin(string username, string password) {
			var usersQueryable = _usersCollection.AsQueryable();

			User user = usersQueryable.Where(user => user.username == username).FirstOrDefault();

			if (user != null) {
				var result = hasher.VerifyHashedPassword(user, user.password, password);
				if (result == PasswordVerificationResult.Success) {
					var claims = new List<Claim> {
								new Claim("username", user.username),
								new Claim("id", user.id.ToString())
							};
					var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
					AuthenticationProperties authProperties = new AuthenticationProperties { };
					await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);
					return new RedirectToPageResult("Chat");
				}
			}

			return Page();
		}

		public async void OnPostSignup(User user) {
			string pass = user.password;
			user.password = null;
			user.password = hasher.HashPassword(user, pass);

			await _usersCollection.InsertOneAsync(user);
		}

		public async Task<IActionResult> OnGetLogout() {
			if (User.Identity.IsAuthenticated) {
				await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
			}

			return new RedirectToPageResult("Index");
		}
	}
}
