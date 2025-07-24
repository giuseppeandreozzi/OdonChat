using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Diagnostics;

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
			//Getting the original URL
			var feauter = Request.HttpContext.Features.Get<IStatusCodeReExecuteFeature>();
			var path = feauter?.OriginalPath;

			_logger.LogWarning($"Error {Code} - Original URL: {path}");
		}
	}

}
