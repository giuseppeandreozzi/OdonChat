using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;
using NLog.Web;
using OdonChat.Hubs;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration["DB_URL"];
var client = new MongoClient(connectionString);

builder.Host.UseNLog();
builder.Services.AddRazorPages().AddMvcOptions(options => {
	options.MaxModelValidationErrors = 1;
});

builder.Services.AddSignalR(e => {
	e.EnableDetailedErrors = true;
});
builder.Services.AddSingleton<IMongoDatabase>(client.GetDatabase("OdonChat"));
builder.Services.AddSingleton<IUserIdProvider, UsernameBasedUserIdProvider>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
	.AddCookie(options => {
		options.Cookie.SameSite = SameSiteMode.Strict;
		options.Cookie.HttpOnly = true;
		options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
		options.AccessDeniedPath = "/Error";
		options.LoginPath = "/";
	});
builder.Services.AddExceptionHandler<OdonChat.utils.ExceptionHandler>();
var app = builder.Build();

if (!app.Environment.IsDevelopment()) {
	app.UseExceptionHandler("/Error");
	app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/Error/{0}");
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapHub<ChatHub>("/chatHub");

app.Run();
