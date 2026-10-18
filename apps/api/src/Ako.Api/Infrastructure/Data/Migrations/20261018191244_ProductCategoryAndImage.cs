using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ako.Api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProductCategoryAndImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "products",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                // Mevcut ürünler geçerli bir kategoriyle dolsun (boş metin enum'a dönüştürülemez).
                defaultValue: "Accessory");

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_products_category",
                table: "products",
                column: "category");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_products_category",
                table: "products");

            migrationBuilder.DropColumn(
                name: "category",
                table: "products");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "products");
        }
    }
}
