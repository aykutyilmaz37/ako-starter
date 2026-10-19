using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Localization;

// PUT /admin/localization/languages/{code} → adını değiştirir, açar/kapatır; 200. Varsayılan dil kapatılamaz.
// Kapalı dil sitede seçilemez ve adresi (/fr/...) varsayılan dile yönlenir; çevirileri silinmez.

#region İstek

public sealed record UpdateLanguageRequest(string Name, bool IsEnabled);

#endregion

#region Doğrulama

internal sealed class UpdateLanguageRequestValidator : AbstractValidator<UpdateLanguageRequest>
{
    public UpdateLanguageRequestValidator() =>
        RuleFor(x => x.Name).NotEmpty().MaximumLength(Language.NameMaxLength);
}

#endregion

#region İş mantığı

public sealed class UpdateLanguageHandler(AppDbContext db, TranslationRefresher refresher)
{
    public async Task<Result<LanguageResponse>> HandleAsync(string code, UpdateLanguageRequest request, CancellationToken ct)
    {
        var language = await db.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
        if (language is null)
        {
            return LocalizationErrors.LanguageNotFound(code);
        }

        language.Update(request.Name, request.IsEnabled);
        await db.SaveChangesAsync(ct);
        await refresher.RefreshAsync(ct);
        return new LanguageResponse(language.Code, language.Name, language.IsDefault, language.IsEnabled);
    }
}

#endregion

#region Endpoint

internal static class UpdateLanguage
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/languages/{code}", Handle).WithName("AdminUpdateLanguage")
            .WithValidation<UpdateLanguageRequest>()
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<LanguageResponse>, ProblemHttpResult>> Handle(
        string code, UpdateLanguageRequest request, UpdateLanguageHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(code, request, ct);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
