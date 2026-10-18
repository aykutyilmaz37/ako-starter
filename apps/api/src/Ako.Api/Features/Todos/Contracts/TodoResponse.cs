namespace Ako.Api.Features.Todos;

// API'nin istemciye döndüğü JSON

public sealed record TodoResponse(Guid Id, string Title, bool IsDone, DateTimeOffset CreatedAt)
{
    public static TodoResponse From(Todo todo) => new(todo.Id, todo.Title, todo.IsDone, todo.CreatedAt);
}
