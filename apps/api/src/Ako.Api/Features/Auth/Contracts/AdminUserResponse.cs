namespace Ako.Api.Features.Auth;

/// <summary>Backoffice kullanıcı listesindeki bir satır.</summary>
public sealed record AdminUserResponse(
    Guid Id,
    string? Email,
    string UserName,
    bool EmailConfirmed,
    bool LockedOut,
    string[] Roles,
    string[] Logins,
    DateTimeOffset CreatedAt);
