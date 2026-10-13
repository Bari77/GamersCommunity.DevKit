namespace DevGateway.Configuration;

public sealed class DevGatewayOptions
{
    public string MicroserviceId { get; set; } = "";
    public string Queue { get; set; } = "";
    public bool InjectFakeCaller { get; set; } = true;
    public FakeCallerOptions FakeCaller { get; set; } = new();
    public List<ResourceOptions> Resources { get; set; } = [];
}
