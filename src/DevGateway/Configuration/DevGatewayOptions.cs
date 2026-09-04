namespace DevGateway.Configuration;

public sealed class DevGatewayOptions
{
    public string MicroserviceId { get; set; } = "";
    public string Queue { get; set; } = "";
    public bool InjectFakeCaller { get; set; } = true;
    public FakeCallerOptions FakeCaller { get; set; } = new();
    public List<ResourceOptions> Resources { get; set; } = [];
}

public sealed class FakeCallerOptions
{
    public string Subject { get; set; } = "00000000-0000-0000-0000-000000000001";
    public string Email { get; set; } = "dev@local.test";
    public string Username { get; set; } = "local-dev";
    public string[] Roles { get; set; } = ["member"];
}

public sealed class ResourceOptions
{
    public string Type { get; set; } = "DATA";
    public string Name { get; set; } = "";
    public List<string> Actions { get; set; } = [];
}
