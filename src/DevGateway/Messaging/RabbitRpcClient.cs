using GamersCommunity.Core.Rabbit;

namespace DevGateway.Messaging;

public sealed class RabbitRpcClient(RabbitMQProducer producer)
{
    public Task<string> CallAsync(string queue, string payload, CancellationToken ct = default)
        => producer.CallAsync(queue, payload, ct);
}
