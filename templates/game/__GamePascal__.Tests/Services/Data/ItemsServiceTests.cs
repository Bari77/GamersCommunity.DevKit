using GamersCommunity.Core.Enums;
using GamersCommunity.Core.Rabbit;
using __GamePascal__.Consumer.Services.Data;
using Xunit;

namespace __GamePascal__.Tests.Services.Data;

public class ItemsServiceTests
{
    [Fact]
    public async Task List_ReturnsSeededItems()
    {
        await using var ctx = FakeDataset.CreateContext();
        var svc = new ItemsService(ctx);
        var json = await svc.HandleAsync(new BusMessage
        {
            Type = BusServiceTypeEnum.DATA,
            Resource = "Items",
            Action = "List",
        });
        Assert.Contains("DEMO_SWORD", json);
    }
}
