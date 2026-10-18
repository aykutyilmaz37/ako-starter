using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ako.Api.Features.Todos;

// POST /todos → yeni görev, 201 + oluşan görev

#region İstek

public sealed record CreateTodoRequest(string Title);

#endregion

#region Doğrulama

internal sealed class CreateTodoRequestValidator : AbstractValidator<CreateTodoRequest>
{
    public CreateTodoRequestValidator() =>
        RuleFor(x => x.Title).NotEmpty().MaximumLength(Todo.TitleMaxLength);
}

#endregion

#region İş mantığı

public sealed class CreateTodoHandler(AppDbContext db, TimeProvider time)
{
    /// <summary>Görevi kaydeder ve kaydedilmiş hâlini döner.</summary>
    public async Task<TodoResponse> HandleAsync(CreateTodoRequest request, CancellationToken ct)
    {
        var todo = Todo.Create(request.Title, time.GetUtcNow());
        db.Todos.Add(todo);
        await db.SaveChangesAsync(ct);
        return TodoResponse.From(todo);
    }
}

#endregion

#region Endpoint

internal static class CreateTodo
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", Handle).WithName("CreateTodo").WithValidation<CreateTodoRequest>();

    private static async Task<Created<TodoResponse>> Handle(
        CreateTodoRequest request, CreateTodoHandler handler, CancellationToken ct)
    {
        var todo = await handler.HandleAsync(request, ct);
        return TypedResults.Created($"/todos/{todo.Id}", todo);
    }
}

#endregion
