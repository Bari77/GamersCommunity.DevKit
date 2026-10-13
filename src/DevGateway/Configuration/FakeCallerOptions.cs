namespace DevGateway.Configuration;

public sealed class FakeCallerOptions
{
    public string Subject { get; set; } = "00000000-0000-0000-0000-000000000001";
    public string Email { get; set; } = "dev@local.test";
    public string Username { get; set; } = "local-dev";
    public string[] Roles { get; set; } = ["member"];
}
