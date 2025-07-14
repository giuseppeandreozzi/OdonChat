using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace OdonChat.Pages {
	[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
	[IgnoreAntiforgeryToken]
	public class ErrorModel : PageModel {

		private readonly ILogger<ErrorModel> _logger;

		[FromRoute]
		public string Code { get; set; }

		public ErrorModel(ILogger<ErrorModel> logger) {
			_logger = logger;
		}

		public void OnGet() {
			_logger.Log(LogLevel.Information, "Error - " + Code);
		}
	}

}
