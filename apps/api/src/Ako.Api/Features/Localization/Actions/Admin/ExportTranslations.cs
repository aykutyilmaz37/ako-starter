using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Xml.Linq;
using Ako.Api.Common;

namespace Ako.Api.Features.Localization;

// GET /admin/localization/export/{namespace}/{culture} → çevirileri dosya olarak indirir (tablodaki ezmeler işlenmiş).
//   api              → Messages.<dil>.resx  (Resources/Localization'daki dosyanın yerine konabilir)
//   site, backoffice → <dil>.json           (apps/web/<uygulama>/app/locales'teki dosyanın yerine konabilir)
// Böylece tablodan yapılan değişiklikler istenince koda geri alınır. Karşılığı olmayan anahtarlar dosyaya yazılmaz.

#region İş mantığı

public sealed record ExportedFile(string FileName, string ContentType, byte[] Content);

public sealed class ExportTranslationsHandler(TranslationCatalog catalog)
{
    public Result<ExportedFile> Handle(string @namespace, string culture)
    {
        if (!TranslationNamespaces.All.Contains(@namespace))
        {
            return LocalizationErrors.NamespaceNotFound(@namespace);
        }

        if (!catalog.Languages.Any(l => l.Code == culture))
        {
            return LocalizationErrors.LanguageNotFound(culture);
        }

        var values = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var key in catalog.Keys(@namespace))
        {
            var value = catalog.OverrideValue(@namespace, culture, key) ?? catalog.FileValue(@namespace, culture, key);
            if (value is not null) values[key] = value;
        }

        return @namespace == TranslationNamespaces.Api
            ? new ExportedFile(ResxFileName(culture), "application/xml", ToResx(values))
            : new ExportedFile($"{culture}.json", "application/json", ToJson(values));
    }

    // Varsayılan dil ana dosyadır (Messages.resx), diğerleri uydu dosya (Messages.en.resx).
    private string ResxFileName(string culture) =>
        culture == catalog.DefaultCulture ? "Messages.resx" : $"Messages.{culture}.resx";

    private static byte[] ToResx(IEnumerable<KeyValuePair<string, string>> values)
    {
        const string formsAssembly = "System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089";
        XNamespace xml = XNamespace.Xml;
        var root = new XElement("root",
            Header("resmimetype", "text/microsoft-resx"),
            Header("version", "2.0"),
            Header("reader", $"System.Resources.ResXResourceReader, {formsAssembly}"),
            Header("writer", $"System.Resources.ResXResourceWriter, {formsAssembly}"),
            values.Select(v => new XElement("data",
                new XAttribute("name", v.Key),
                new XAttribute(xml + "space", "preserve"),
                new XElement("value", v.Value))));

        using var stream = new MemoryStream();
        new XDocument(new XDeclaration("1.0", "utf-8", null), root).Save(stream);
        return stream.ToArray();

        static XElement Header(string name, string value) =>
            new("resheader", new XAttribute("name", name), new XElement("value", value));
    }

    private static byte[] ToJson(IDictionary<string, string> values) =>
        Encoding.UTF8.GetBytes(JsonSerializer.Serialize(values, new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping, // Türkçe karakterler ç değil ç olarak
        }) + "\n");
}

#endregion

#region Endpoint

internal static class ExportTranslations
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/export/{namespace}/{culture}", Handle).WithName("AdminExportTranslations")
            .Produces<byte[]>(StatusCodes.Status200OK, "application/octet-stream")
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static IResult Handle(string @namespace, string culture, ExportTranslationsHandler handler)
    {
        var result = handler.Handle(@namespace, culture);
        return result.IsSuccess
            ? TypedResults.File(result.Value.Content, result.Value.ContentType, result.Value.FileName)
            : result.Error.ToProblem();
    }
}

#endregion
