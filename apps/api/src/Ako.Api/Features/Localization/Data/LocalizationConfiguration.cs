using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ako.Api.Features.Localization;

internal sealed class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> builder)
    {
        builder.HasKey(l => l.Code);
        builder.Property(l => l.Code).HasMaxLength(Language.CodeMaxLength);
        builder.Property(l => l.Name).HasMaxLength(Language.NameMaxLength);

        // Şablonla gelen diller migration'da oluşur. Yeni diller backoffice'ten eklenir.
        builder.HasData(
            Language.Create("tr", "Türkçe", isDefault: true),
            Language.Create("en", "English"),
            Language.Create("de", "Deutsch"));
    }
}

internal sealed class TranslationConfiguration : IEntityTypeConfiguration<Translation>
{
    public void Configure(EntityTypeBuilder<Translation> builder)
    {
        builder.Property(t => t.Id).ValueGeneratedNever();
        builder.Property(t => t.Culture).HasMaxLength(Language.CodeMaxLength);
        builder.Property(t => t.Namespace).HasMaxLength(32);
        builder.Property(t => t.Key).HasMaxLength(Translation.KeyMaxLength);
        builder.Property(t => t.Value).HasMaxLength(Translation.ValueMaxLength);
        builder.HasIndex(t => new { t.Culture, t.Namespace, t.Key }).IsUnique();
    }
}
