using System.Reflection.Emit;
using Azul.Core.UserAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace Azul.Infrastructure;

// Modified to include UserStats while preserving existing functionality
public class AzulDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public DbSet<UserStats> UserStats { get; set; }

    public AzulDbContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Bestaande identity configuratie (niet aanpassen)
        builder.Entity<User>().ToTable("Users");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("ExternalLogins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        // Nieuwe configuratie voor UserStats
        builder.Entity<User>()
        .HasOne(u => u.Stats)
        .WithOne()
        .HasForeignKey<UserStats>(s => s.UserId);
    }
        
}
