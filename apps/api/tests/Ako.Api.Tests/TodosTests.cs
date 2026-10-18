using System.Net;
using System.Net.Http.Json;
using Ako.Api.Features.Todos;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class TodosTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Gorev_olusturulur_tamamlanir_ve_silinir()
    {
        var create = await _client.PostAsJsonAsync("/todos", new CreateTodoRequest("  Süt al  "));
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var todo = (await create.Content.ReadFromJsonAsync<TodoResponse>())!;
        Assert.Equal("Süt al", todo.Title);
        Assert.False(todo.IsDone);

        var update = await _client.PutAsJsonAsync($"/todos/{todo.Id}", new UpdateTodoRequest(todo.Title, true));
        Assert.True((await update.Content.ReadFromJsonAsync<TodoResponse>())!.IsDone);

        var list = await _client.GetFromJsonAsync<TodoResponse[]>("/todos");
        Assert.Contains(list!, t => t.Id == todo.Id);

        Assert.Equal(HttpStatusCode.NoContent, (await _client.DeleteAsync($"/todos/{todo.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.DeleteAsync($"/todos/{todo.Id}")).StatusCode);
    }

    [Fact]
    public async Task Bos_baslik_400_doner()
    {
        var response = await _client.PostAsJsonAsync("/todos", new CreateTodoRequest(""));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
