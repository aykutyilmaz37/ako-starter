using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Todos;

// GET /todos/{id} → tek görev, yoksa 404

#region İş mantığı

public sealed class GetTodoHandler(AppDbContext db)
{
    /// <summary>Görevi id ile bulur; yoksa "todos.not_found" hatası döner.</summary>
    public async Task<Result<TodoResponse>> HandleAsync(Guid id, CancellationToken ct)
    {
        var todo = await db.Todos.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, ct);
        return todo is null ? TodoErrors.NotFound(id) : TodoResponse.From(todo);
    }
}

#endregion

#region Endpoint

internal static class GetTodo
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{id:guid}", Handle).WithName("GetTodo").ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<TodoResponse>, ProblemHttpResult>> Handle(
        Guid id, GetTodoHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(id, ct);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
