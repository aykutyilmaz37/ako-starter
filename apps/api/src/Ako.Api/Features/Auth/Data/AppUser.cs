using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// Uygulama kullanıcısı. E-posta, şifre özeti, kilitleme, 2FA gibi alanlar IdentityUser'dan gelir;
// projeye özel alanlar (ad, avatar…) buraya eklenir.
public sealed class AppUser : IdentityUser<Guid>
{
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // ako:begin guest
    /// <summary>Son görülme. Yalnızca misafirler için tutulur: süresi dolan (kullanılmayan) misafirler silinir.</summary>
    public DateTimeOffset LastActiveAt { get; set; } = DateTimeOffset.UtcNow;
    // ako:end guest
}
