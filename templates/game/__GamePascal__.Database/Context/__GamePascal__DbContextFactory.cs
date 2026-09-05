using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace __GamePascal__.Database.Context;

/// <summary>
/// Factory used by EF Core tools (<c>dotnet ef</c>) at design-time.
/// </summary>
public class __GamePascal__DbContextFactory : IDesignTimeDbContextFactory<__GamePascal__DbContext>
{
    public __GamePascal__DbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<__GamePascal__DbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,14333;User Id=sa;Password=Your_password123;Initial Catalog=__GamePascal__;TrustServerCertificate=True;Encrypt=True;")
            .Options;
        return new __GamePascal__DbContext(options);
    }
}
