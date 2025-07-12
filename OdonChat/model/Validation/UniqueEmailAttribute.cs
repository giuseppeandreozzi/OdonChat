using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;

namespace OdonChat.model.Validation {
	public class UniqueEmailAttribute : ValidationAttribute {

		protected override ValidationResult? IsValid(object? value, ValidationContext validationContext) {
			IMongoCollection<User> _users = validationContext.GetService<IMongoDatabase>().GetCollection<User>("Users");

			string email = (string) value;

			User user = _users.AsQueryable().Where(u => u.email == email).FirstOrDefault();

			return (user == null) ? ValidationResult.Success : new ValidationResult("E-mail already taken");
		}
	}
}
