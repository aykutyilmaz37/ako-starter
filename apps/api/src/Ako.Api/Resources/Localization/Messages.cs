using System.Globalization;
using System.Resources;

// Messages.resx Türkçedir; dil eşleşmediğinde buna düşülür.
[assembly: NeutralResourcesLanguage("tr")]

namespace Ako.Api.Resources.Localization;

/// <summary>
/// Messages.resx (tr, varsayılan) ve Messages.en.resx'e erişim. Dil, RequestLocalization
/// middleware'inin Accept-Language'e göre ayarladığı CultureInfo.CurrentUICulture'dan gelir.
/// Statik olması bilinçli: validator'lar, FluentValidation'ın global ayarları ve
/// ProblemDetails özelleştirmesi DI'a bağlı kalmadan aynı yerden okur.
/// </summary>
public static class Messages
{
    private static readonly ResourceManager Resources = new("Ako.Api.Resources.Localization.Messages", typeof(Messages).Assembly);

    /// <summary>Anahtarın çevirisini döner; yoksa anahtarın kendisini (eksik çeviri görünür kalsın diye).</summary>
    public static string Get(string key, params object?[] args)
    {
        var format = Find(key) ?? key;
        return args.Length == 0 ? format : string.Format(CultureInfo.CurrentCulture, format, args);
    }

    public static string? Find(string key) => Resources.GetString(key, CultureInfo.CurrentUICulture);
}
