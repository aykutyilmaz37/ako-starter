using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Todos;

// DELETE /todos/{id} → 204 (gövdesiz). Yoksa 404.

#region İş mantığı

public sealed class DeleteTodoHandler(AppDbContext db)
{
    /// <summary>Görevi tek sorguyla siler; silinecek kayıt yoksa "todos.not_found".</summary>
    public async Task<Result> HandleAsync(Guid id, CancellationToken ct)
    {
        var deleted = await db.Todos.Where(t => t.Id == id).ExecuteDeleteAsync(ct);
        return deleted == 0 ? TodoErrors.NotFound(id) : Result.Success();
    }
}

#endregion

#region Endpoint

internal static class DeleteTodo
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapDelete("/{id:guid}", Handle).WithName("DeleteTodo").ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<NoContent, ProblemHttpResult>> Handle(
        Guid id, DeleteTodoHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(id, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}

#endregion
