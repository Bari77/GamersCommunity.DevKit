using GamersCommunity.Core.Rabbit;

namespace DevGateway.Messaging;

public sealed class RabbitRpcClient(RabbitMQProducer producer)
{
    public async Task<string> CallAsync(string queue, string payload, CancellationToken ct = default)
    {
        var props = await producer.SendMessageAsync(queue, payload, ct);
        return await producer.GetResponseAsync(props, ct);
    }
}
