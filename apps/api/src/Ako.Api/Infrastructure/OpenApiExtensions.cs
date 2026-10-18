using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Ako.Api.Infrastructure;

public static class OpenApiExtensions
{
    private const string Bearer = "Bearer";

    /// <summary>
    /// OpenAPI şemasına bearer token tanımını ekler ve yetki isteyen endpoint'leri işaretler.
    /// Swagger'da "Authorize" butonu bu sayede çıkar; Orval da hangi çağrının token istediğini bilir.
    /// </summary>
    public static IServiceCollection AddAppOpenApi(this IServiceCollection services) =>
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
                document.Components.SecuritySchemes[Bearer] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    Description = "POST /auth/login yanıtındaki accessToken",
                };
                return Task.CompletedTask;
            });

            options.AddOperationTransformer((operation, context, _) =>
            {
                var metadata = context.Description.ActionDescriptor.EndpointMetadata;
                if (metadata.OfType<IAuthorizeData>().Any() && !metadata.OfType<IAllowAnonymous>().Any())
                {
                    operation.Security ??= [];
                    operation.Security.Add(new OpenApiSecurityRequirement
                    {
                        [new OpenApiSecuritySchemeReference(Bearer, context.Document)] = [],
                    });
                    operation.Responses ??= new OpenApiResponses();
                    operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
                }
                return Task.CompletedTask;
            });

            // [AsParameters] kayıtlarının sorgu parametreleri (Page, PageSize…) camelCase yazılır; bağlama zaten
            // büyük/küçük harfe duyarsızdır. api-client'ta { page: 1, pageSize: 20 } olarak görünür.
            options.AddOperationTransformer((operation, _, _) =>
            {
                foreach (var parameter in operation.Parameters?.OfType<OpenApiParameter>() ?? [])
                {
                    if (parameter.In == ParameterLocation.Query && parameter.Name is { Length: > 0 } name)
                    {
                        parameter.Name = char.ToLowerInvariant(name[0]) + name[1..];
                    }
                }
                return Task.CompletedTask;
            });
        });
}
