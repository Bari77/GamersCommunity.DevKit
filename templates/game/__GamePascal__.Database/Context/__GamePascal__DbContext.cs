using __GamePascal__.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace __GamePascal__.Database.Context;

public partial class __GamePascal__DbContext : DbContext
{
    public __GamePascal__DbContext(DbContextOptions<__GamePascal__DbContext> options) : base(options)
    {
    }

    public virtual DbSet<Item> Items { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>(entity =>
        {
            entity.ToTable("Items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Entitled).HasMaxLength(200).IsRequired();
        });
    }
}
