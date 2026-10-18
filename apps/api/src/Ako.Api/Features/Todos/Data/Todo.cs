using Ako.Api.Common;

namespace Ako.Api.Features.Todos;

// ÖRNEK ÖZELLİK: auth ile kullanıcıya özel veri nasıl tutulur, onu gösterir. Projede gerekmiyorsa silin.
// Veritabanındaki "todos" tablosunun C# karşılığı

public sealed class Todo : IEntity
{
    public const int TitleMaxLength = 200;

    private Todo() { } // EF Core veritabanından okurken bu boş constructor'ı kullanır.

    public Guid Id { get; private set; }

    /// <summary>Görevin sahibi. Her kullanıcı yalnızca kendi görevlerini görür.</summary>
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = null!;
    public bool IsDone { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    /// <summary>Yeni görev oluşturur; başlangıçta tamamlanmamıştır.</summary>
    public static Todo Create(Guid userId, string title, DateTimeOffset now) => new()
    {
        Id = Guid.CreateVersion7(now),
        UserId = userId,
        Title = title.Trim(),
        CreatedAt = now,
    };

    /// <summary>Başlığı ve tamamlanma durumunu günceller.</summary>
    public void Update(string title, bool isDone)
    {
        Title = title.Trim();
        IsDone = isDone;
    }
}
