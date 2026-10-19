using System.Net.Http.Headers; // ako:auth
using System.Net.Http.Json;
using Ako.Api.Common; // ako:auth
using Ako.Api.Features.Auth; // ako:auth
using Ako.Api.Features.Localization; // ako:lang
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.BearerToken; // ako:auth
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity; // ako:auth
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace Ako.Api.Tests;

/// <summary>
/// Testler için gerçek bir Postgres'i Docker'da (Testcontainers) ayağa kaldırır, migration'ları uygular
/// ve API'yi bu veritabanına bağlı olarak bellekte çalıştırır. Tüm test sınıfları aynı container'ı paylaşır.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    // ako:begin auth
    public const string AdminEmail = "admin@test.local";
    public const string Password = "Test1234!";
    // ako:end auth

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17-alpine").Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // "Testing": appsettings.Development (yerel DB, dev admin, otomatik migration) yüklenmez.
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Default", _postgres.GetConnectionString());
        // ako:begin auth
        builder.UseSetting("RateLimiting:Auth:PermitLimit", "10000"); // testler aynı "IP"den çok sayıda kayıt yapar
        builder.UseSetting("Api:EnableAdminEndpoints", "true");
        builder.ConfigureTestServices(services => services.AddSingleton<IAppEmailSender>(Emails));
        // ako:end auth
    }

    // ako:begin auth
    /// <summary>Gönderilen e-posta kodlarını yakalar; testler kodu buradan okur.</summary>
    public CapturingEmailSender Emails { get; } = new();
    // ako:end auth

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
        await Services.GetRequiredService<TranslationRefresher>().RefreshAsync(CancellationToken.None); // ako:lang

        // ako:begin auth
        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var admin = new AppUser { UserName = AdminEmail, Email = AdminEmail, EmailConfirmed = true };
        await users.CreateAsync(admin, Password);
        await users.AddToRolesAsync(admin, [AppRoles.Admin, AppRoles.User]);
        // ako:end auth
    }

    // ako:begin auth

    /// <summary>Yeni bir kullanıcı kaydeder, giriş yapar ve token'lı bir HttpClient döner.</summary>
    public async Task<HttpClient> CreateUserClientAsync(string? email = null)
    {
        email ??= $"user-{Guid.NewGuid():N}@test.local";
        var client = CreateClient();
        (await client.PostAsJsonAsync("/auth/register", new { email, password = Password })).EnsureSuccessStatusCode();
        var code = Emails.LastCode(email, EmailCodePurpose.ConfirmEmail);
        (await client.PostAsJsonAsync("/auth/email/confirm", new { email, code })).EnsureSuccessStatusCode();
        return await LoginAsync(client, email);
    }

    /// <summary>Misafir (anonim) kullanıcı oluşturur; token'ları ve token'lı bir HttpClient döner.</summary>
    public async Task<(HttpClient Client, AccessTokenResponse Tokens)> CreateGuestClientAsync()
    {
        var client = CreateClient();
        var response = await client.PostAsync("/auth/guest", null);
        response.EnsureSuccessStatusCode();
        var tokens = (await response.Content.ReadFromJsonAsync<AccessTokenResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        return (client, tokens);
    }

    public Task<HttpClient> CreateAdminClientAsync() => LoginAsync(CreateClient(), AdminEmail);

    private static async Task<HttpClient> LoginAsync(HttpClient client, string email)
    {
        var response = await client.PostAsJsonAsync("/auth/login", new { email, password = Password });
        response.EnsureSuccessStatusCode();
        var token = await response.Content.ReadFromJsonAsync<AccessTokenResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.AccessToken);
        return client;
    }

    // ako:end auth

    async Task IAsyncLifetime.DisposeAsync()
    {
        await _postgres.DisposeAsync();
        await base.DisposeAsync();
    }
}

// ako:begin auth
public sealed class CapturingEmailSender : IAppEmailSender
{
    private readonly System.Collections.Concurrent.ConcurrentDictionary<(string, EmailCodePurpose), string> _codes = new();

    public Task SendCodeAsync(string email, EmailCodePurpose purpose, string code, CancellationToken ct)
    {
        _codes[(email.ToLowerInvariant(), purpose)] = code;
        return Task.CompletedTask;
    }

    public string LastCode(string email, EmailCodePurpose purpose) => _codes[(email.ToLowerInvariant(), purpose)];

    public bool HasCode(string email, EmailCodePurpose purpose) => _codes.ContainsKey((email.ToLowerInvariant(), purpose));
}

// ako:end auth

[CollectionDefinition(Name)]
public sealed class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
