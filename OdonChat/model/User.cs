using MongoDB.Bson;
using OdonChat.model.Validation;
using System.ComponentModel.DataAnnotations;

namespace OdonChat.model {
	public class User {
		public ObjectId id { get; set; }

		[Required]
		[StringLength(50, MinimumLength = 3)]
		[UniqueUsername]
		public string username { get; set; }

		[Required]
		public string password { get; set; }

		public byte[] image { get; set; } = Array.Empty<byte>();

		[Required]
		[EmailAddress]
		[UniqueEmail]
		public string email { get; set; }

		[Required]
		[DataType(DataType.Date)]
		public DateTime birthDate { get; set; }

		public Dictionary<string, string> chats { get; set; } = new Dictionary<string, string>();
	}
}
