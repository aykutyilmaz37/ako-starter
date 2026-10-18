using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Todos;

// GET /todos → tüm görevler, en yeni önce

#region İş mantığı

public sealed class ListTodosHandler(AppDbContext db)
{
    /// <summary>Tüm görevleri oluşturulma tarihine göre yeniden eskiye döner.</summary>
    public Task<TodoResponse[]> HandleAsync(CancellationToken ct) =>
        db.Todos
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TodoResponse(t.Id, t.Title, t.IsDone, t.CreatedAt))
            .ToArrayAsync(ct);
}

#endregion

#region Endpoint

internal static class ListTodos
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", Handle).WithName("ListTodos");

    private static async Task<Ok<TodoResponse[]>> Handle(ListTodosHandler handler, CancellationToken ct) =>
        TypedResults.Ok(await handler.HandleAsync(ct));
}

#endregion
