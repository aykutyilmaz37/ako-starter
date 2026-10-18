using System.Text.Json.Serialization;

namespace Ako.Api.Features.Products;

/// <summary>
/// Ürün kategorisi. JSON'da metin olarak döner ("Coffee"); api-client'ta 'Coffee' | 'Equipment' | 'Accessory' olur.
/// Veritabanında da metin olarak tutulur, sıra değişse bile eski kayıtlar bozulmaz.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<ProductCategory>))]
public enum ProductCategory
{
    Coffee,
    Equipment,
    Accessory,
}
