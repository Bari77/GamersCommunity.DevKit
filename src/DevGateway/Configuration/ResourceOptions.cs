namespace DevGateway.Configuration;

public sealed class ResourceOptions
{
    public string Type { get; set; } = "DATA";
    public string Name { get; set; } = "";
    public List<string> Actions { get; set; } = [];
}
