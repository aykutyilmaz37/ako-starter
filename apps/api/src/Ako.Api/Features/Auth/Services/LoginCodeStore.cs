using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Distributed;

namespace Ako.Api.Features.Auth;

/// <summary>
/// Sosyal giriş sonunda istemciye URL'de verilen tek kullanımlık kod. Token'lar URL'ye hiç yazılmaz;
/// istemci bu kodu POST /auth/exchange ile token'a çevirir. Kod 60 saniye geçerlidir ve bir kez kullanılır.
/// Varsayılan depo bellek içidir; birden fazla sunucu çalışacaksa IDistributedCache Redis'e çevrilmeli.
/// </summary>
public sealed class LoginCodeStore(IDistributedCache cache)
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromSeconds(60);

    public async Task<string> CreateAsync(Guid userId, CancellationToken ct)
    {
        var code = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        await cache.SetStringAsync(Key(code), userId.ToString(),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = Lifetime }, ct);
        return code;
    }

    /// <summary>Kodu okur ve hemen siler; geçersiz ya da kullanılmışsa null döner.</summary>
    public async Task<Guid?> ConsumeAsync(string code, CancellationToken ct)
    {
        var value = await cache.GetStringAsync(Key(code), ct);
        if (value is null)
        {
            return null;
        }

        await cache.RemoveAsync(Key(code), ct);
        return Guid.Parse(value);
    }

    private static string Key(string code) => $"auth:login-code:{code}";
}
