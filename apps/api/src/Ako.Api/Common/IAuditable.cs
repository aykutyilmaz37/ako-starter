namespace Ako.Api.Common;

/// <summary>
/// Bu arayüzü uygulayan entity'lerin denetim alanları kayıt sırasında otomatik doldurulur
/// (bkz. Infrastructure/Data/AuditInterceptor). Entity'de yalnızca "private set" ile tanımlanır,
/// kodda elle atanmaz. CreatedBy/UpdatedBy, giriş yapılmamış isteklerde (ör. seed, arka plan işi) boştur.
/// </summary>
public interface IAuditable
{
    DateTimeOffset CreatedAt { get; }
    Guid? CreatedBy { get; }
    DateTimeOffset UpdatedAt { get; }
    Guid? UpdatedBy { get; }
}
