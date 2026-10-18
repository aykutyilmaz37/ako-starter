namespace Ako.Api.Features.Todos;

// Tüm /todos adreslerini kaydeder (Program.cs bunu çağırır)

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodos(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/todos").WithTags("Todos");

        ListTodos.Map(group);
        GetTodo.Map(group);
        CreateTodo.Map(group);
        UpdateTodo.Map(group);
        DeleteTodo.Map(group);

        return app;
    }
}
