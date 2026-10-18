using System.Security.Claims;

namespace Ako.Api.Common;

/// <summary>Uygulamadaki roller. Projeye göre genişletilir.</summary>
public static class AppRoles
{
    public const string Admin = "Admin";
    public const string User = "User";
}

/// <summary>Endpoint'lerde RequireAuthorization(AppPolicies.X) ile kullanılan yetki kuralları.</summary>
public static class AppPolicies
{
    public const string Admin = "Admin";
}

/// <summary>
/// İsteği yapan kullanıcı. Özellikler Auth özelliğine bağımlı olmadan kullanıcı kimliğini buradan okur.
/// Yalnızca RequireAuthorization() olan endpoint'lerde kullanılmalı.
/// </summary>
public interface ICurrentUser
{
    Guid Id { get; }
}

internal sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid Id =>
        Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw new InvalidOperationException("Kimliği doğrulanmamış istekte ICurrentUser kullanıldı.");
}
