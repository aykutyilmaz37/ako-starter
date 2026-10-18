using Ako.Api.Common;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// PUT /admin/users/{id}/roles  { roles: ["Admin", "User"] } → kullanıcının rollerini tam olarak bu liste yapar (yalnızca Admin)

#region İstek

public sealed record SetUserRolesRequest(string[] Roles);

#endregion

#region Doğrulama

internal sealed class SetUserRolesRequestValidator : AbstractValidator<SetUserRolesRequest>
{
    private static readonly string[] Known = [AppRoles.Admin, AppRoles.User];

    public SetUserRolesRequestValidator() =>
        RuleForEach(x => x.Roles).Must(role => Known.Contains(role)).WithMessage((_, role) => $"'{role}' tanımlı bir rol değil.");
}

#endregion

#region İş mantığı

public sealed class SetUserRolesHandler(UserManager<AppUser> users, ICurrentUser currentUser)
{
    /// <summary>Eksik rolleri ekler, fazlaları çıkarır. Admin kendi Admin rolünü kaldıramaz (kilitlenmeyi önler).</summary>
    public async Task<Result<string[]>> HandleAsync(Guid id, SetUserRolesRequest request)
    {
        var user = await users.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return AuthErrors.UserNotFound(id);
        }

        var wanted = request.Roles.Distinct().ToArray();
        if (id == currentUser.Id && !wanted.Contains(AppRoles.Admin))
        {
            return AuthErrors.CannotRemoveOwnAdmin();
        }

        var current = await users.GetRolesAsync(user);
        await users.RemoveFromRolesAsync(user, current.Except(wanted));
        await users.AddToRolesAsync(user, wanted.Except(current));

        // Roller token'a yazılıdır. Güvenlik damgası değişince refresh token'lar geçersizleşir: kullanıcının mevcut
        // access token'ı süresi dolana kadar (en fazla 1 saat) çalışır, sonra yeniden giriş yapması gerekir.
        await users.UpdateSecurityStampAsync(user);
        return wanted.Order().ToArray();
    }
}

#endregion

#region Endpoint

internal static class SetUserRoles
{
    public static void Map(RouteGroupBuilder admin) =>
        admin.MapPut("/users/{id:guid}/roles", Handle).WithName("AdminSetUserRoles")
            .WithValidation<SetUserRolesRequest>()
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<string[]>, ProblemHttpResult>> Handle(
        Guid id, SetUserRolesRequest request, SetUserRolesHandler handler)
    {
        var result = await handler.HandleAsync(id, request);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
