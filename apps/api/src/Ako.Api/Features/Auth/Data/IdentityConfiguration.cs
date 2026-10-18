using Ako.Api.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ako.Api.Features.Auth;

// Identity tablolarına sade isimler verir (asp_net_users yerine users…) ve rolleri migration ile oluşturur.

internal sealed class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder) => builder.ToTable("users");
}

internal sealed class RoleConfiguration : IEntityTypeConfiguration<IdentityRole<Guid>>
{
    // Sabit Id'ler: roller migration'da oluşur, her ortamda aynıdır.
    public static readonly Guid AdminRoleId = new("0199f2a0-0000-7000-8000-000000000001");
    public static readonly Guid UserRoleId = new("0199f2a0-0000-7000-8000-000000000002");

    public void Configure(EntityTypeBuilder<IdentityRole<Guid>> builder)
    {
        builder.ToTable("roles");
        builder.HasData(
            new IdentityRole<Guid> { Id = AdminRoleId, Name = AppRoles.Admin, NormalizedName = "ADMIN", ConcurrencyStamp = "admin" },
            new IdentityRole<Guid> { Id = UserRoleId, Name = AppRoles.User, NormalizedName = "USER", ConcurrencyStamp = "user" });
    }
}

internal sealed class UserRoleConfiguration : IEntityTypeConfiguration<IdentityUserRole<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder) => builder.ToTable("user_roles");
}

internal sealed class UserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserClaim<Guid>> builder) => builder.ToTable("user_claims");
}

internal sealed class UserLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserLogin<Guid>> builder) => builder.ToTable("user_logins");
}

internal sealed class UserTokenConfiguration : IEntityTypeConfiguration<IdentityUserToken<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserToken<Guid>> builder) => builder.ToTable("user_tokens");
}

internal sealed class RoleClaimConfiguration : IEntityTypeConfiguration<IdentityRoleClaim<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityRoleClaim<Guid>> builder) => builder.ToTable("role_claims");
}
