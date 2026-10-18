using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Auth;

// GET /admin/users?page=1&pageSize=20&search=ali → kullanıcılar, rolleri ve bağlı sosyal hesaplarıyla (yalnızca Admin)

#region İstek

public sealed record ListUsersQuery(int Page = 1, int PageSize = Paging.DefaultPageSize, string? Search = null);

#endregion

#region Doğrulama

internal sealed class ListUsersQueryValidator : AbstractValidator<ListUsersQuery>
{
    public ListUsersQueryValidator()
    {
        RuleFor(x => x.Page).ValidPage();
        RuleFor(x => x.PageSize).ValidPageSize();
        RuleFor(x => x.Search).MaximumLength(100);
    }
}

#endregion

#region İş mantığı

public sealed class ListUsersHandler(AppDbContext db)
{
    /// <summary>En yeni kullanıcı önce; search varsa e-posta ve kullanıcı adında arar.</summary>
    public async Task<PagedResponse<AdminUserResponse>> HandleAsync(ListUsersQuery query, CancellationToken ct)
    {
        var users = db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            users = users.Where(u => EF.Functions.ILike(u.Email!, pattern) || EF.Functions.ILike(u.UserName!, pattern));
        }

        var now = DateTimeOffset.UtcNow;
        return await users
            .OrderByDescending(u => u.CreatedAt)
            .ThenBy(u => u.Id)
            .Select(u => new AdminUserResponse(
                u.Id,
                u.Email,
                u.UserName!,
                u.EmailConfirmed,
                u.LockoutEnd != null && u.LockoutEnd > now,
                db.UserRoles.Where(ur => ur.UserId == u.Id)
                    .Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Name!)
                    .OrderBy(name => name)
                    .ToArray(),
                db.UserLogins.Where(l => l.UserId == u.Id).Select(l => l.LoginProvider).ToArray(),
                u.CreatedAt))
            .ToPagedAsync(query.Page, query.PageSize, ct);
    }
}

#endregion

#region Endpoint

internal static class ListUsers
{
    public static void Map(RouteGroupBuilder admin) =>
        admin.MapGet("/users", Handle).WithName("AdminListUsers").WithValidation<ListUsersQuery>();

    private static async Task<Ok<PagedResponse<AdminUserResponse>>> Handle(
        [AsParameters] ListUsersQuery query, ListUsersHandler handler, CancellationToken ct) =>
        TypedResults.Ok(await handler.HandleAsync(query, ct));
}

#endregion
