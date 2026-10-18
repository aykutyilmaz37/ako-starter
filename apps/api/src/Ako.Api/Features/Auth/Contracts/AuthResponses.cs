namespace Ako.Api.Features.Auth;

/// <summary>Giriş yapmış kullanıcının bilgileri.</summary>
public sealed record MeResponse(Guid Id, string? Email, string UserName, bool EmailConfirmed, string[] Roles, string[] Logins);

/// <summary>Bu kurulumda etkin giriş yöntemleri; istemci hangi butonları göstereceğine buna göre karar verir.</summary>
/// <param name="External">Tarayıcı akışıyla giriş yapılabilen sağlayıcılar (google, github…).</param>
/// <param name="Native">Mobilde native SDK ile id token gönderilebilen sağlayıcılar (google, apple).</param>
public sealed record ProvidersResponse(string[] External, string[] Native);
