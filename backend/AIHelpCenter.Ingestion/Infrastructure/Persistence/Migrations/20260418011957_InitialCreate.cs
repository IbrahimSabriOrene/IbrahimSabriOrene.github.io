using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIHelpCenter.Ingestion.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "ingestion");

            migrationBuilder.CreateTable(
                name: "audio_files",
                schema: "ingestion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    StoragePath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    TenantId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CleanStoragePath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DiarizationJson = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Transcription = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audio_files", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_audio_files_CreatedAtUtc",
                schema: "ingestion",
                table: "audio_files",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_audio_files_Status",
                schema: "ingestion",
                table: "audio_files",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_audio_files_TenantId",
                schema: "ingestion",
                table: "audio_files",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audio_files",
                schema: "ingestion");
        }
    }
}
