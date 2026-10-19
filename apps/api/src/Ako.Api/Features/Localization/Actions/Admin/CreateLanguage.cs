using System.Globalization;
using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Ako.Api.Resources.Localization;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Localization;

// POST /admin/localization/languages → yeni dil ekler (açık olarak), 201. Metinleri çeviri tablosundan girilir;
// girilmeyenler varsayılan dilde görünür.

#region İstek

/// <param name="Code">BCP 47 kodu: "fr", "pt-BR"…</param>
/// <param name="Name">Dilin kendi dilindeki adı: "Français".</param>
public sealed record CreateLanguageRequest(string Code, string Name);

#endregion

#region Doğrulama

internal sealed class CreateLanguageRequestValidator : AbstractValidator<CreateLanguageRequest>
{
    public CreateLanguageRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(Language.CodeMaxLength)
            .Must(IsKnownCulture).WithMessage(_ => Messages.Get("localization.culture_invalid"));
        RuleFor(x => x.Name).NotEmpty().MaximumLength(Language.NameMaxLength);
    }

    private static bool IsKnownCulture(string code)
    {
        try
        {
            return CultureInfo.GetCultureInfo(code, predefinedOnly: true).Name.Equals(code, StringComparison.OrdinalIgnoreCase);
        }
        catch (CultureNotFoundException)
        {
            return false;
        }
    }
}

#endregion

#region İş mantığı

public sealed class CreateLanguageHandler(AppDbContext db, TranslationRefresher refresher)
{
    public async Task<Result<LanguageResponse>> HandleAsync(CreateLanguageRequest request, CancellationToken ct)
    {
        var code = CultureInfo.GetCultureInfo(request.Code).Name; // "PT-br" → "pt-BR"
        if (await db.Languages.AnyAsync(l => l.Code == code, ct))
        {
            return LocalizationErrors.LanguageExists(code);
        }

        var language = Language.Create(code, request.Name);
        db.Languages.Add(language);
        await db.SaveChangesAsync(ct);
        await refresher.RefreshAsync(ct); // API bu dili hemen Accept-Language'de kabul eder
        return new LanguageResponse(language.Code, language.Name, language.IsDefault, language.IsEnabled);
    }
}

#endregion

#region Endpoint

internal static class CreateLanguage
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/languages", Handle).WithName("AdminCreateLanguage")
            .WithValidation<CreateLanguageRequest>()
            .ProducesProblem(StatusCodes.Status409Conflict);

    private static async Task<Results<Created<LanguageResponse>, ProblemHttpResult>> Handle(
        CreateLanguageRequest request, CreateLanguageHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(request, ct);
        return result.IsSuccess
            ? TypedResults.Created($"/admin/localization/languages/{result.Value.Code}", result.Value)
            : result.Error.ToProblem();
    }
}

#endregion
