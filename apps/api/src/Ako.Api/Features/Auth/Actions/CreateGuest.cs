using Ako.Api.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// Misafir (anonim) kullanıcı:
//   POST /auth/guest        → misafir oluşturur, /auth/login ile aynı token'ı döner. Mobil uygulama ilk açılışta
//                             token yoksa bunu çağırır; sonrasında her istek bearer'lıdır.
//   POST /auth/guest/claim  → kayıtlı kullanıcı (token'ı olan), misafirken yaptıklarını hesabına alır.

#region İstek

public sealed record ClaimGuestRequest(string GuestRefreshToken);

#endregion

#region Doğrulama

internal sealed class ClaimGuestRequestValidator : AbstractValidator<ClaimGuestRequest>
{
    public ClaimGuestRequestValidator() => RuleFor(x => x.GuestRefreshToken).NotEmpty();
}

#endregion

#region Endpoint

internal static class CreateGuest
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/guest", Create).WithName("CreateGuest")
            .AllowAnonymous()
            .Produces<AccessTokenResponse>();

        // Yalnızca kayıtlı kullanıcı: misafirin kendisi başka bir misafiri "talep edemez".
        group.MapPost("/guest/claim", Claim).WithName("ClaimGuest")
            .RequireAuthorization(AppPolicies.Member)
            .WithValidation<ClaimGuestRequest>()
            .ProducesProblem(StatusCodes.Status400BadRequest);
    }

    private static async Task<Results<EmptyHttpResult, ProblemHttpResult>> Create(
        GuestAccounts guests, SignInManager<AppUser> signIn)
    {
        var result = await guests.CreateAsync();
        if (!result.IsSuccess)
        {
            return result.Error.ToProblem();
        }

        await TokenIssuer.IssueAsync(signIn, result.Value);
        return TypedResults.Empty;
    }

    private static async Task<Results<NoContent, ProblemHttpResult, UnauthorizedHttpResult>> Claim(
        ClaimGuestRequest request, System.Security.Claims.ClaimsPrincipal principal, GuestAccounts guests,
        UserManager<AppUser> users, CancellationToken ct)
    {
        if (await users.GetUserAsync(principal) is not { } user)
        {
            return TypedResults.Unauthorized();
        }

        var result = await guests.ClaimAsync(user, request.GuestRefreshToken, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}

#endregion
