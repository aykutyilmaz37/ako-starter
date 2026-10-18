using System.Net;
using System.Net.Http.Json;
using Ako.Api.Features.Todos;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class TodosTests(ApiFactory factory)
{
    [Fact]
    public async Task Gorev_olusturulur_tamamlanir_ve_silinir()
    {
        var client = await factory.CreateUserClientAsync();
        var create = await client.PostAsJsonAsync("/todos", new CreateTodoRequest("  Süt al  "));
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var todo = (await create.Content.ReadFromJsonAsync<TodoResponse>())!;
        Assert.Equal("Süt al", todo.Title);
        Assert.False(todo.IsDone);

        var update = await client.PutAsJsonAsync($"/todos/{todo.Id}", new UpdateTodoRequest(todo.Title, true));
        Assert.True((await update.Content.ReadFromJsonAsync<TodoResponse>())!.IsDone);

        var list = await client.GetFromJsonAsync<TodoResponse[]>("/todos");
        Assert.Contains(list!, t => t.Id == todo.Id);

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/todos/{todo.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/todos/{todo.Id}")).StatusCode);
    }

    [Fact]
    public async Task Bos_baslik_400_doner()
    {
        var client = await factory.CreateUserClientAsync();
        var response = await client.PostAsJsonAsync("/todos", new CreateTodoRequest(""));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Token_olmadan_401_doner()
    {
        var response = await factory.CreateClient().GetAsync("/todos");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Kullanici_baskasinin_gorevini_goremez()
    {
        var ali = await factory.CreateUserClientAsync();
        var ayse = await factory.CreateUserClientAsync();
        var create = await ali.PostAsJsonAsync("/todos", new CreateTodoRequest("Ali'nin görevi"));
        var todo = (await create.Content.ReadFromJsonAsync<TodoResponse>())!;

        Assert.Empty((await ayse.GetFromJsonAsync<TodoResponse[]>("/todos"))!);
        Assert.Equal(HttpStatusCode.NotFound, (await ayse.GetAsync($"/todos/{todo.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await ayse.DeleteAsync($"/todos/{todo.Id}")).StatusCode);
        Assert.Single((await ali.GetFromJsonAsync<TodoResponse[]>("/todos"))!);
    }
}
