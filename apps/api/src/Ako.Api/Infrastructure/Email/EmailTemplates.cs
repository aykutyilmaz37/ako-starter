using System.Collections.Concurrent;
using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;

namespace Ako.Api.Infrastructure.Email;

/// <summary>
/// Resources/EmailTemplates/*.html şablonlarını doldurur. Şablonlar uygulamaya gömülüdür (embedded resource).
/// Her e-posta, içerik şablonu (ör. Code.html) _Layout.html içindeki {{{content}}} yerine konarak oluşur.
///
/// Bilerek basit tutuldu: döngü ya da koşul yok, yalnızca yer tutucu. Daha dinamik şablonlar gerekirse
/// (Razor, Scriban, MJML…) yalnızca bu sınıf değişir; çağıran kod aynı kalır.
/// </summary>
public static partial class EmailTemplates
{
    private static readonly ConcurrentDictionary<string, string> Cache = new();

    /// <param name="template">Dosya adı uzantısız, ör. "Code".</param>
    /// <param name="values">Yer tutucu değerleri. Hem içerik şablonunda hem layout'ta kullanılabilir.</param>
    public static string Render(string template, IReadOnlyDictionary<string, string> values)
    {
        var content = Fill(Load(template), values);
        var layoutValues = new Dictionary<string, string>(values)
        {
            ["content"] = content,
            ["lang"] = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName,
        };
        return Fill(Load("_Layout"), layoutValues);
    }

    private static string Fill(string html, IReadOnlyDictionary<string, string> values) =>
        Placeholder().Replace(html, match =>
        {
            var raw = match.Groups["raw"].Success;
            var key = raw ? match.Groups["raw"].Value : match.Groups["encoded"].Value;
            var value = values.TryGetValue(key, out var v) ? v : "";
            return raw ? value : WebUtility.HtmlEncode(value);
        });

    private static string Load(string name) => Cache.GetOrAdd(name, static n =>
    {
        using var stream = typeof(EmailTemplates).Assembly.GetManifestResourceStream($"EmailTemplates/{n}.html")
            ?? throw new InvalidOperationException($"E-posta şablonu bulunamadı: Resources/EmailTemplates/{n}.html");
        using var reader = new StreamReader(stream);
        return HtmlComment().Replace(reader.ReadToEnd(), ""); // şablon açıklamaları maile girmesin
    });

    [GeneratedRegex(@"\{\{\{\s*(?<raw>\w+)\s*\}\}\}|\{\{\s*(?<encoded>\w+)\s*\}\}")]
    private static partial Regex Placeholder();

    [GeneratedRegex(@"<!--.*?-->\s*", RegexOptions.Singleline)]
    private static partial Regex HtmlComment();
}
