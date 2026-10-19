using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Todos;

// ÖRNEK ÖZELLİK: misafir verisi taşıma kuralı. Görevler kullanıcıya özel olduğu için hesaba geçerken sahibi
// değişir; çakışma yoktur (her görev ayrı bir kayıttır). Projede gerekmiyorsa features/todos ile birlikte silin.
internal sealed class TodoGuestData(AppDbContext db) : IGuestDataMerger
{
    public Task MergeAsync(Guid guestId, Guid targetUserId, CancellationToken ct) =>
        db.Todos.Where(t => t.UserId == guestId)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.UserId, targetUserId), ct);

    public Task DeleteAsync(Guid guestId, CancellationToken ct) =>
        db.Todos.Where(t => t.UserId == guestId).ExecuteDeleteAsync(ct);
}
