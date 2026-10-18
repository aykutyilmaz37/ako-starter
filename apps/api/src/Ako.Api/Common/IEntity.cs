namespace Ako.Api.Common;

/// <summary>
/// Domain entity işareti. ArchTests bu arayüzü uygulayan tiplerin EF Core, ASP.NET Core ve
/// FluentValidation'a bağımlı olmadığını doğrular; iş kuralları altyapıdan bağımsız kalır.
/// </summary>
public interface IEntity;
