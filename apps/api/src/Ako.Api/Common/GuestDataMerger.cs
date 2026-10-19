namespace Ako.Api.Common;

/// <summary>
/// Misafirin (anonim kullanıcı) kullanıcıya özel verisini taşıyan özellik kancası. Kişisel veri tutan her özellik
/// bunu uygular ve DI'a kaydeder; Auth özelliği hepsini çalıştırır ama hiçbirini tanımaz (özellikler birbirini
/// kullanamaz). Çakışma kuralı (birleştir, üzerine yaz, at) özelliğin kendi kararıdır.
/// </summary>
public interface IGuestDataMerger
{
    /// <summary>Misafir kayıt olunca ya da bir hesaba girince: misafirin verisi hedef kullanıcıya geçer.</summary>
    Task MergeAsync(Guid guestId, Guid targetUserId, CancellationToken ct);

    /// <summary>Misafir hiç hesaba geçmeden süresi dolunca (temizlik işi): misafirin verisi silinir.</summary>
    Task DeleteAsync(Guid guestId, CancellationToken ct);
}
