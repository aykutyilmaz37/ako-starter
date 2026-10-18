using Ako.Api.Common;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using FluentValidation;

namespace Ako.Api.Features.Auth;

// POST /auth/exchange → sosyal giriş kodunu access + refresh token'a çevirir (/auth/login ile aynı yanıt)

#region İstek

public sealed record ExchangeCodeRequest(string Code);

#endregion

#region Doğrulama

internal sealed class ExchangeCodeRequestValidator : AbstractValidator<ExchangeCodeRequest>
{
    public ExchangeCodeRequestValidator() => RuleFor(x => x.Code).NotEmpty();
}

#endregion

#region İş mantığı

public sealed class ExchangeCodeHandler(LoginCodeStore codes, UserManager<AppUser> users)
{
    /// <summary>Kodu tüketir (bir daha kullanılamaz) ve sahibi olan kullanıcıyı döner.</summary>
    public async Task<Result<AppUser>> HandleAsync(ExchangeCodeRequest request, CancellationToken ct)
    {
        var userId = await codes.ConsumeAsync(request.Code, ct);
        var user = userId is null ? null : await users.FindByIdAsync(userId.Value.ToString());
        return user is null ? AuthErrors.InvalidCode() : user;
    }
}

#endregion

#region Endpoint

internal static class ExchangeCode
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/exchange", Handle).WithName("ExchangeLoginCode")
            .WithValidation<ExchangeCodeRequest>()
            .Produces<AccessTokenResponse>();

    private static async Task<Results<EmptyHttpResult, ProblemHttpResult>> Handle(
        ExchangeCodeRequest request, ExchangeCodeHandler handler, SignInManager<AppUser> signIn, CancellationToken ct)
    {
        var result = await handler.HandleAsync(request, ct);
        if (!result.IsSuccess)
        {
            return result.Error.ToProblem();
        }

        await TokenIssuer.IssueAsync(signIn, result.Value);
        return TypedResults.Empty;
    }
}

#endregion
