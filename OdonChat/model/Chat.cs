using MongoDB.Bson;
using System.Collections;

namespace OdonChat.model {
	public class Chat {
		public ObjectId id { get; set; }
		public List<Message> messages { get; set; }
	}

	public class Message {
		public string userFrom { get; set; }
		public string text { get; set; }
		public DateTime time { get; set; }
	}
}
