using Ako.Api.Common;

namespace Ako.Api.Features.Todos;

// Metni Resources/Localization/Messages*.resx'te

internal static class TodoErrors
{
    public static Error NotFound(Guid id) => Error.NotFound("todos.not_found", id);
}
