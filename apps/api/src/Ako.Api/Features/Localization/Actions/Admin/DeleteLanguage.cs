using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Localization;

// DELETE /admin/localization/languages/{code} → dili ve tablodaki çevirilerini siler; 204.
// Varsayılan dil silinemez (409). Dosyadaki metinler etkilenmez: dil yeniden eklenirse varsayılanlar geri gelir.

#region İş mantığı

public sealed class DeleteLanguageHandler(AppDbContext db, TranslationRefresher refresher)
{
    public async Task<Result> HandleAsync(string code, CancellationToken ct)
    {
        var language = await db.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
        if (language is null)
        {
            return LocalizationErrors.LanguageNotFound(code);
        }

        if (language.IsDefault)
        {
            return LocalizationErrors.LanguageIsDefault(code);
        }

        await db.Translations.Where(t => t.Culture == code).ExecuteDeleteAsync(ct);
        db.Languages.Remove(language);
        await db.SaveChangesAsync(ct);
        await refresher.RefreshAsync(ct);
        return Result.Success();
    }
}

#endregion

#region Endpoint

internal static class DeleteLanguage
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapDelete("/languages/{code}", Handle).WithName("AdminDeleteLanguage")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

    private static async Task<Results<NoContent, ProblemHttpResult>> Handle(
        string code, DeleteLanguageHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(code, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}

#endregion
