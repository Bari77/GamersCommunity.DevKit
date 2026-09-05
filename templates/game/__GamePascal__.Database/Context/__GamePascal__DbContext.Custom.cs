using Microsoft.EntityFrameworkCore;

namespace __GamePascal__.Database.Context;

/// <summary>
/// Design-time DbContext configuration (<c>dotnet ef</c> tools).
/// At runtime, the connection string is injected via DI in <c>__GamePascal__.Consumer</c>.
/// </summary>
public partial class __GamePascal__DbContext
{
    public __GamePascal__DbContext()
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer(
                "Server=127.0.0.1,14333;User Id=sa;Password=Your_password123;Initial Catalog=__GamePascal__;TrustServerCertificate=True;Encrypt=True;");
        }
    }
}
