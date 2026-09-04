using DevGateway.Configuration;
using DevGateway.Endpoints;
using DevGateway.Messaging;
using DevGateway.Middleware;
using GamersCommunity.Core.Rabbit;
using Serilog;

Console.Title = "DevGateway";

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console());

builder.Services.AddOptions<RabbitMQSettings>()
    .Bind(builder.Configuration.GetSection("RabbitMQ"))
    .ValidateOnStart();

builder.Services.AddOptions<DevGatewayOptions>()
    .Bind(builder.Configuration.GetSection("DevGateway"))
    .ValidateOnStart();

builder.Services.AddSingleton<Serilog.ILogger>(_ => Log.Logger);
builder.Services.AddSingleton<RabbitMQProducer>();
builder.Services.AddSingleton<RabbitRpcClient>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("dev_cors", p =>
    {
        var origins = Enumerable.Range(4200, 11)
            .Select(port => $"http://localhost:{port}")
            .ToArray();
        p.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

if (builder.Environment.IsEnvironment("Docker") ||
    string.Equals(Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER"), "true", StringComparison.OrdinalIgnoreCase))
{
    builder.WebHost.UseUrls("http://0.0.0.0:8080");
}

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("dev_cors");
app.MapDevGatewayEndpoints();

Log.Information("DevGateway started ({Environment})", app.Environment.EnvironmentName);
await app.RunAsync();
