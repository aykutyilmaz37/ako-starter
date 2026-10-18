namespace Ako.Api.Features.Todos;

// Tüm /todos adreslerini kaydeder (Program.cs bunu çağırır)

// ÖRNEK ÖZELLİK: tüm adresler giriş ister ve her kullanıcı yalnızca kendi görevlerini görür.
// Başka bir kullanıcının görevine erişim 404 döner (varlığı bile belli edilmez).
public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodos(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/todos").WithTags("Todos").RequireAuthorization();

        ListTodos.Map(group);
        GetTodo.Map(group);
        CreateTodo.Map(group);
        UpdateTodo.Map(group);
        DeleteTodo.Map(group);

        return app;
    }
}
