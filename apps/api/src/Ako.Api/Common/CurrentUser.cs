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

    /// <summary>Giriş yapılmamışsa null; kimliğin zorunlu olmadığı yerler (ör. denetim alanları) için.</summary>
    Guid? IdOrNull { get; }
}

internal sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid Id => IdOrNull ?? throw new InvalidOperationException("Kimliği doğrulanmamış istekte ICurrentUser.Id kullanıldı.");

    public Guid? IdOrNull =>
        Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
