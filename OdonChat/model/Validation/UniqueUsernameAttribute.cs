using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;

namespace OdonChat.model.Validation {
	public class UniqueUsernameAttribute : ValidationAttribute {
		protected override ValidationResult? IsValid(object? value, ValidationContext validationContext) {
			IMongoCollection<User> _users = validationContext.GetService<IMongoDatabase>().GetCollection<User>("Users");

			string username = (string)value;

			User user = _users.AsQueryable().Where(u => u.username == username).FirstOrDefault();

			return (user == null) ? ValidationResult.Success : new ValidationResult("Username already taken");
		}
	}
}
