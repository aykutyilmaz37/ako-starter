using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Localization;

// PUT /admin/localization/translations → bir anahtarın bir dildeki metnini ezer; 200 + satırın güncel hâli.
// Value boşsa ya da dosyadaki değerle aynıysa ezme silinir (metin dosyadakine döner).

#region İstek

public sealed record SetTranslationRequest(string Namespace, string Culture, string Key, string? Value);

#endregion

#region Doğrulama

internal sealed class SetTranslationRequestValidator : AbstractValidator<SetTranslationRequest>
{
    public SetTranslationRequestValidator()
    {
        RuleFor(x => x.Namespace).NotEmpty().Must(ns => TranslationNamespaces.All.Contains(ns));
        RuleFor(x => x.Culture).NotEmpty().MaximumLength(Language.CodeMaxLength);
        RuleFor(x => x.Key).NotEmpty().MaximumLength(Translation.KeyMaxLength);
        RuleFor(x => x.Value).MaximumLength(Translation.ValueMaxLength);
    }
}

#endregion

#region İş mantığı

public sealed class SetTranslationHandler(AppDbContext db, TranslationCatalog catalog, TranslationRefresher refresher)
{
    /// <summary>
    /// Ezmeyi ekler, günceller ya da siler; ardından katalog bu API kopyasında hemen yenilenir.
    /// Yalnızca dosyalarda tanımlı anahtarlar çevrilebilir (yeni metin önce koda, varsayılan dosyaya eklenir).
    /// </summary>
    public async Task<Result<TranslationEntryResponse>> HandleAsync(SetTranslationRequest request, CancellationToken ct)
    {
        if (!catalog.Languages.Any(l => l.Code == request.Culture))
        {
            return LocalizationErrors.LanguageNotFound(request.Culture);
        }

        if (!catalog.Keys(request.Namespace).Contains(request.Key))
        {
            return LocalizationErrors.KeyNotFound(request.Key);
        }

        var existing = await db.Translations.FirstOrDefaultAsync(
            t => t.Culture == request.Culture && t.Namespace == request.Namespace && t.Key == request.Key, ct);
        var value = string.IsNullOrWhiteSpace(request.Value) ? null : request.Value;
        var sameAsFile = value == catalog.FileValue(request.Namespace, request.Culture, request.Key);

        if (value is null || sameAsFile)
        {
            if (existing is not null) db.Translations.Remove(existing);
        }
        else if (existing is null)
        {
            db.Translations.Add(Translation.Create(request.Culture, request.Namespace, request.Key, value));
        }
        else
        {
            existing.Update(value);
        }

        await db.SaveChangesAsync(ct);
        await refresher.RefreshAsync(ct);
        return TranslationEntryResponse.From(catalog, request.Namespace, request.Key);
    }
}

#endregion

#region Endpoint

internal static class SetTranslation
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/translations", Handle).WithName("AdminSetTranslation")
            .WithValidation<SetTranslationRequest>()
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<TranslationEntryResponse>, ProblemHttpResult>> Handle(
        SetTranslationRequest request, SetTranslationHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(request, ct);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
