using Microsoft.AspNetCore.Diagnostics;

namespace OdonChat.utils {
	public class ExceptionHandler : IExceptionHandler {
		private readonly ILogger<ExceptionHandler> _logger;

		public ExceptionHandler(ILogger<ExceptionHandler> logger) {
			_logger = logger;
		}

		public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken) {
			string errorMessage = $"Exception occured! - Source: {exception.Source} - Message: {exception.Message}";
			_logger.LogError(errorMessage);

			return ValueTask.FromResult(false);
		}
	}
}
