using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace __GamePascal__.Consumer;

public class ConsumerWorker(IServiceScopeFactory scopeFactory, ILogger logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var consumer = scope.ServiceProvider.GetRequiredService<__GamePascal__ServiceConsumer>();
        try
        {
            await consumer.StartListeningAsync(ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            logger.Information("ConsumerWorker stopping (cancellation requested).");
        }
        catch (Exception ex)
        {
            logger.Fatal(ex, "Fatal RabbitMQ communication error. Exiting so the container can restart.");
            throw;
        }
    }
}
