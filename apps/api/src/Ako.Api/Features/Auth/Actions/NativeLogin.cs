using Ako.Api.Common;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using FluentValidation;

namespace Ako.Api.Features.Auth;

// POST /auth/native/{provider} → mobilde native Google/Apple girişinden gelen id token ile giriş.
// Uygulama içi hesap seçici (tek dokunuş) için; tarayıcı akışına alternatiftir, onun yerine geçmez.

#region İstek

public sealed record NativeLoginRequest(string IdToken);

#endregion

#region Doğrulama

internal sealed class NativeLoginRequestValidator : AbstractValidator<NativeLoginRequest>
{
    public NativeLoginRequestValidator() => RuleFor(x => x.IdToken).NotEmpty();
}

#endregion

#region İş mantığı

public sealed class NativeLoginHandler(IdTokenValidator idTokens, ExternalUserResolver resolver)
{
    /// <summary>Id token'ı doğrular, kullanıcıyı bulur ya da oluşturur (web'deki hesapla aynı kayıt).</summary>
    public async Task<Result<AppUser>> HandleAsync(string provider, NativeLoginRequest request, CancellationToken ct)
    {
        var p = ExternalProviders.Find(provider);
        if (p is null || !IdTokenValidator.SupportedSchemes.Contains(p.Scheme) || idTokens.AudiencesFor(p.Scheme).Length == 0)
        {
            return AuthErrors.ProviderUnavailable(provider);
        }

        var identity = await idTokens.ValidateAsync(p.Scheme, request.IdToken, ct);
        if (identity is null)
        {
            return AuthErrors.InvalidIdToken();
        }

        return await resolver.ResolveAsync(new ExternalIdentity(p, identity.Value.Subject, identity.Value.Email));
    }
}

#endregion

#region Endpoint

internal static class NativeLogin
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/native/{provider}", Handle).WithName("NativeLogin")
            .WithValidation<NativeLoginRequest>()
            .Produces<AccessTokenResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

    private static async Task<Results<EmptyHttpResult, ProblemHttpResult>> Handle(
        string provider, NativeLoginRequest request, NativeLoginHandler handler, SignInManager<AppUser> signIn, CancellationToken ct)
    {
        var result = await handler.HandleAsync(provider, request, ct);
        if (!result.IsSuccess)
        {
            return result.Error.ToProblem();
        }

        await TokenIssuer.IssueAsync(signIn, result.Value);
        return TypedResults.Empty;
    }
}

#endregion
