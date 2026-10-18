using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ako.Api.Features.Todos;

// Veritabanı ayarı

internal sealed class TodoConfiguration : IEntityTypeConfiguration<Todo>
{
    public void Configure(EntityTypeBuilder<Todo> builder)
    {
        builder.Property(t => t.Id).ValueGeneratedNever();
        builder.Property(t => t.Title).HasMaxLength(Todo.TitleMaxLength);
        builder.HasIndex(t => new { t.UserId, t.CreatedAt });
    }
}
