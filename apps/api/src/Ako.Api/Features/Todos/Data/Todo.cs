using Ako.Api.Common;

namespace Ako.Api.Features.Todos;

// ÖRNEK ÖZELLİK: auth ile kullanıcıya özel veri nasıl tutulur, onu gösterir. Projede gerekmiyorsa silin.
// Veritabanındaki "todos" tablosunun C# karşılığı

public sealed class Todo : IEntity, IAuditable
{
    public const int TitleMaxLength = 200;

    private Todo() { } // EF Core veritabanından okurken bu boş constructor'ı kullanır.

    public Guid Id { get; private set; }

    /// <summary>Görevin sahibi. Her kullanıcı yalnızca kendi görevlerini görür.</summary>
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = null!;
    public bool IsDone { get; private set; }

    // Denetim alanları (IAuditable): kayıt sırasında otomatik dolar, elle atanmaz.
    public DateTimeOffset CreatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public Guid? UpdatedBy { get; private set; }

    /// <summary>Yeni görev oluşturur; başlangıçta tamamlanmamıştır.</summary>
    public static Todo Create(Guid userId, string title) => new()
    {
        Id = Guid.CreateVersion7(),
        UserId = userId,
        Title = title.Trim(),
    };

    /// <summary>Başlığı ve tamamlanma durumunu günceller.</summary>
    public void Update(string title, bool isDone)
    {
        Title = title.Trim();
        IsDone = isDone;
    }
}
