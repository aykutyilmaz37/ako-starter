using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Todos;

// PUT /todos/{id} → görevi günceller, 200 + güncel görev. Yoksa 404.

#region İstek

public sealed record UpdateTodoRequest(string Title, bool IsDone);

#endregion

#region Doğrulama

internal sealed class UpdateTodoRequestValidator : AbstractValidator<UpdateTodoRequest>
{
    public UpdateTodoRequestValidator() =>
        RuleFor(x => x.Title).NotEmpty().MaximumLength(Todo.TitleMaxLength);
}

#endregion

#region İş mantığı

public sealed class UpdateTodoHandler(AppDbContext db)
{
    /// <summary>Görevi bulup günceller; yoksa "todos.not_found" hatası döner.</summary>
    public async Task<Result<TodoResponse>> HandleAsync(Guid id, UpdateTodoRequest request, CancellationToken ct)
    {
        var todo = await db.Todos.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (todo is null)
        {
            return TodoErrors.NotFound(id);
        }

        todo.Update(request.Title, request.IsDone);
        await db.SaveChangesAsync(ct);
        return TodoResponse.From(todo);
    }
}

#endregion

#region Endpoint

internal static class UpdateTodo
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/{id:guid}", Handle).WithName("UpdateTodo")
            .WithValidation<UpdateTodoRequest>()
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<TodoResponse>, ProblemHttpResult>> Handle(
        Guid id, UpdateTodoRequest request, UpdateTodoHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(id, request, ct);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
