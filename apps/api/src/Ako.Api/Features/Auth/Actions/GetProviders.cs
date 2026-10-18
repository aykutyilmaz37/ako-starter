using Microsoft.AspNetCore.Http.HttpResults;

namespace Ako.Api.Features.Auth;

// GET /auth/providers → hangi sosyal giriş butonları gösterilecek (herkese açık)

#region Endpoint

internal static class GetProviders
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/providers", Handle).WithName("GetAuthProviders");

    /// <summary>Ayarı dolu sağlayıcıları ve native girişi açık olanları listeler.</summary>
    private static Ok<ProvidersResponse> Handle(IConfiguration configuration, IdTokenValidator idTokens) =>
        TypedResults.Ok(new ProvidersResponse(
            External: [.. ExternalProviders.All.Where(p => ExternalProviders.IsConfigured(configuration, p)).Select(p => p.Slug)],
            Native: [.. IdTokenValidator.SupportedSchemes
                .Where(s => idTokens.AudiencesFor(s).Length > 0)
                .Select(s => ExternalProviders.All.First(p => p.Scheme == s).Slug)]));
}

#endregion
