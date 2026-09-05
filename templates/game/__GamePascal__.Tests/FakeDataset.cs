using __GamePascal__.Database.Context;
using __GamePascal__.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace __GamePascal__.Tests;

public static class FakeDataset
{
    public static __GamePascal__DbContext CreateContext(string? name = null)
    {
        var options = new DbContextOptionsBuilder<__GamePascal__DbContext>()
            .UseInMemoryDatabase(name ?? Guid.NewGuid().ToString())
            .Options;
        var ctx = new __GamePascal__DbContext(options);
        ctx.Items.AddRange(
            new Item { Id = 1, Entitled = "DEMO_SWORD", CreationDate = DateTime.UtcNow, ModificationDate = DateTime.UtcNow },
            new Item { Id = 2, Entitled = "DEMO_SHIELD", CreationDate = DateTime.UtcNow, ModificationDate = DateTime.UtcNow }
        );
        ctx.SaveChanges();
        return ctx;
    }
}
