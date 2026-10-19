using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ako.Api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class GuestUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "last_active_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "concurrency_stamp", "name", "normalized_name" },
                values: new object[] { new Guid("0199f2a0-0000-7000-8000-000000000003"), "guest", "Guest", "GUEST" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "id",
                keyValue: new Guid("0199f2a0-0000-7000-8000-000000000003"));

            migrationBuilder.DropColumn(
                name: "last_active_at",
                table: "users");
        }
    }
}
