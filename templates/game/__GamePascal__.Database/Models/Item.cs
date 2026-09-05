using GamersCommunity.Core.Database;

namespace __GamePascal__.Database.Models;

public class Item : IKeyTable
{
    public int Id { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime ModificationDate { get; set; }
    public string Entitled { get; set; } = string.Empty;
}
