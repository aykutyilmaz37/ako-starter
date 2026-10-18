namespace Ako.Api.Features.Products;

internal static class ProductRules
{
    /// <summary>Görsel adresi boş, API'nin kendi yolu ("/images/…") ya da https adresi olabilir.</summary>
    public static bool IsValidImageUrl(string? url) =>
        string.IsNullOrWhiteSpace(url)
        || (url.StartsWith('/') && !url.StartsWith("//", StringComparison.Ordinal))
        || (Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps);
}
