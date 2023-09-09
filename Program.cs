using BontoAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Net;

var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// Load configuration from appsettings.json file
builder.Configuration.AddJsonFile("appsettings.Development.json", optional: false, reloadOnChange: true);

// Access the Configuration object
var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Enable Cross Origin Resource Sharing
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
        builder =>
        {
            builder.WithOrigins("http://[::1]:4200", "http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Cache-Control", "must-revalidate", "ETag");
        });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["JwtSettings:Issuer"],
        ValidAudience = configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:SecretKey"]))
    };
});

builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Listen(IPAddress.Loopback, 8080);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.Use(async (context, next) =>
    {
        await next();

        if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value))
        {
            context.Request.Path = "/index.html";
            await next();
        }
    });
    app.UseDefaultFiles();
    app.UseStaticFiles();
}
//app.UseHttpsRedirection();
app.UseCors(myAllowSpecificOrigins);
//app.UseAuthorization();
app.MapControllers();
app.Run();