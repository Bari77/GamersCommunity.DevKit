using GamersCommunity.Core.Rabbit;
using Microsoft.Extensions.Options;
using Serilog;

namespace __GamePascal__.Consumer;

public class __GamePascal__ServiceConsumer(IOptions<RabbitMQSettings> otps, BusRouter router, ILogger logger)
    : BasicServiceConsumer(otps, router, logger)
{
    public override string QUEUE { get; set; } = "__QueueName__";
}
