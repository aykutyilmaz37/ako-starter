using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ako.Api.Common;

public enum ErrorType
{
    Failure,
    NotFound,
    Conflict,
    TooManyRequests,
}

/// <summary>
/// Beklenen iş hatası. Handler'lar exception atmak yerine bunu döner; endpoint ProblemDetails'e çevirir.
/// Code makine tarafından okunur (ör. "products.sku_taken"), istemci buna göre davranabilir.
/// Metin taşımaz: Code aynı zamanda Resources/Localization/Messages*.resx anahtarıdır, Args ise mesajdaki {0}, {1}…
/// yerlerine konur. Çeviri isteğin diline göre <see cref="ProblemDetailsLocalization"/>'da yapılır.
/// </summary>
public sealed record Error(string Code, ErrorType Type, object?[] Args)
{
    public static Error NotFound(string code, params object?[] args) => new(code, ErrorType.NotFound, args);
    public static Error Conflict(string code, params object?[] args) => new(code, ErrorType.Conflict, args);
    public static Error Failure(string code, params object?[] args) => new(code, ErrorType.Failure, args);
    public static Error TooManyRequests(string code, params object?[] args) => new(code, ErrorType.TooManyRequests, args);

    /// <summary>RFC 9457 ProblemDetails; hata kodu "code" alanında taşınır.</summary>
    public ProblemHttpResult ToProblem() => TypedResults.Problem(
        statusCode: Type switch
        {
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.TooManyRequests => StatusCodes.Status429TooManyRequests,
            _ => StatusCodes.Status400BadRequest,
        },
        extensions: new Dictionary<string, object?>
        {
            ["code"] = Code,
            [ProblemDetailsLocalization.ArgsKey] = Args,
        });
}

public readonly struct Result
{
    private Result(Error? error) => Error = error;

    public Error? Error { get; }

    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsSuccess => Error is null;

    public static Result Success() => new(null);

    public static implicit operator Result(Error error) => new(error);
}

public readonly struct Result<T>
{
    private readonly T? _value;

    private Result(T value) => _value = value;
    private Result(Error error) => Error = error;

    public Error? Error { get; }

    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsSuccess => Error is null;

    public T Value => IsSuccess ? _value! : throw new InvalidOperationException("Başarısız sonucun değeri okunamaz.");

    public static implicit operator Result<T>(T value) => new(value);
    public static implicit operator Result<T>(Error error) => new(error);
}
