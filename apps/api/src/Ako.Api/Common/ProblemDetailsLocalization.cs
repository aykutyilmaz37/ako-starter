using Ako.Api.Resources.Localization;

namespace Ako.Api.Common;

/// <summary>
/// Yazılan her ProblemDetails'i isteğin diline (Accept-Language) çevirir.
/// Handler ve endpoint'lerde metin yoktur; hepsi burada, hata koduna göre resx'ten gelir.
/// </summary>
public static class ProblemDetailsLocalization
{
    /// <summary>Mesaj argümanlarını ToProblem'den buraya taşıyan iç alan; yanıta yazılmaz.</summary>
    public const string ArgsKey = "__args";

    public static void Apply(ProblemDetailsContext context)
    {
        var problem = context.ProblemDetails;

        problem.Title = problem is HttpValidationProblemDetails
            ? Messages.Get("problem.validation")
            : Messages.Find($"problem.{problem.Status}") ?? problem.Title;

        problem.Extensions.Remove(ArgsKey, out var rawArgs);
        if (problem.Extensions.TryGetValue("code", out var code) && code is string key)
        {
            problem.Detail = Messages.Get(key, rawArgs as object?[] ?? []);
        }
    }
}
