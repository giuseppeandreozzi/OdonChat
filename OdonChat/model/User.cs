using MongoDB.Bson;

namespace OdonChat.model {
	public class User {
		public ObjectId id { get; set; }
		public string username { get; set; }
		public string password { get; set; }
		public string email { get; set; }
		public DateTime birthDate { get; set; }
	}
}
