using Ako.Api.Common;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

/// <summary>Sağlayıcıdan gelen kimlik bilgisi (tarayıcı akışı ya da native id token).</summary>
public sealed record ExternalIdentity(ExternalProviders.Provider Provider, string ProviderKey, string? Email);

/// <summary>
/// Sosyal girişte "bu kişi bizim hangi kullanıcımız?" sorusunu cevaplar; gerekirse kullanıcıyı oluşturur.
/// Web ve mobil, tarayıcı ve native akışların hepsi buradan geçer.
/// </summary>
public sealed class ExternalUserResolver(UserManager<AppUser> users)
{
    public async Task<Result<AppUser>> ResolveAsync(ExternalIdentity identity)
    {
        var scheme = identity.Provider.Scheme;

        // 1) Bu sağlayıcı hesabıyla daha önce giriş yapılmış.
        var user = await users.FindByLoginAsync(scheme, identity.ProviderKey);
        if (user is not null)
        {
            return user;
        }

        // 2) Aynı e-postayla bir hesap var: sağlayıcı e-postayı doğruluyorsa bağla, doğrulamıyorsa reddet.
        if (identity.Email is not null && await users.FindByEmailAsync(identity.Email) is { } existing)
        {
            if (!identity.Provider.TrustsEmail)
            {
                return AuthErrors.EmailInUse();
            }

            var link = await users.AddLoginAsync(existing, new UserLoginInfo(scheme, identity.ProviderKey, scheme));
            return link.Succeeded ? existing : AuthErrors.UserCreationFailed();
        }

        // 3) Yeni kullanıcı. E-posta yoksa (ör. X) kullanıcı adı sağlayıcıdan türetilir.
        user = new AppUser
        {
            UserName = identity.Email ?? $"{identity.Provider.Slug}-{identity.ProviderKey}",
            Email = identity.Email,
            EmailConfirmed = identity.Email is not null && identity.Provider.TrustsEmail,
        };

        var created = await users.CreateAsync(user);
        if (!created.Succeeded)
        {
            return AuthErrors.UserCreationFailed();
        }

        await users.AddToRoleAsync(user, AppRoles.User);
        await users.AddLoginAsync(user, new UserLoginInfo(scheme, identity.ProviderKey, scheme));
        return user;
    }
}
