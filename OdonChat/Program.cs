using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;
using OdonChat.Hubs;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration["DB_URL"];
var client = new MongoClient(connectionString);

// Add services to the container.
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
		options.AccessDeniedPath = "/";
		options.LoginPath = "/";
	});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment()) {
	app.UseExceptionHandler("/Error");
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapHub<ChatHub>("/chatHub");

app.Run();
