using GamersCommunity.Core.Logging;
using GamersCommunity.Core.Rabbit;
using GamersCommunity.Core.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using __GamePascal__.Consumer.Configuration;
using __GamePascal__.Consumer.Services.Infra;
using __GamePascal__.Database.Context;

namespace __GamePascal__.Consumer;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.Title = "__GamePascal__ MicroService";
        try
        {
            var builder = Host.CreateDefaultBuilder(args)
                .ConfigureLogging((context, logging) =>
                {
                    var loggerSettings = context.Configuration.GetSection("LoggerSettings").Get<LoggerSettings>() ?? new LoggerSettings();
                    Logger.Initialize(loggerSettings, "__GamePascal__ MS", context.HostingEnvironment);
                    logging.ClearProviders();
                    Log.Information("Starting ...");
                })
                .ConfigureServices((context, services) =>
                {
                    services.AddOptions<RabbitMQSettings>().Bind(context.Configuration.GetSection("RabbitMQ")).ValidateOnStart();
                    services.AddOptions<AppSettings>().Bind(context.Configuration.GetSection("AppSettings")).ValidateOnStart();
                    services.AddDbContext<__GamePascal__DbContext>((sp, options) =>
                    {
                        var connectionString = context.Configuration.GetConnectionString("Database")
                            ?? throw new InvalidOperationException("Connection string 'Database' is missing.");
                        options.UseSqlServer(connectionString);
                    });
                    services.AddSingleton<Serilog.ILogger>(sp => Log.Logger);
                    services.Scan(scan => scan
                        .FromAssembliesOf(typeof(AppSettings))
                        .AddClasses(c => c.AssignableTo<IBusService>())
                        .AsImplementedInterfaces()
                        .WithScopedLifetime());
                    services.AddScoped<HealthService>();
                    services.AddScoped<BusRouter>();
                    services.AddScoped<__GamePascal__ServiceConsumer>();
                    services.AddHostedService<ConsumerWorker>();
                });

            var host = builder.Build();
            await ApplyDatabaseMigrationsAsync(host.Services);
            var environment = host.Services.GetRequiredService<IHostEnvironment>();
            Log.Information("Started in {Environment} environment...", environment.EnvironmentName);
            await host.RunAsync();
        }
        catch (HostAbortedException ex) { Log.Fatal(ex, "Aborted."); }
        catch (Exception ex) { Log.Fatal(ex, "Terminated unexpectedly."); }
        finally { Log.Information("Stopped ..."); }
    }

    private static async Task ApplyDatabaseMigrationsAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<__GamePascal__DbContext>();
        await dbContext.Database.MigrateAsync();
        Log.Information("Database migrations applied.");
    }
}
