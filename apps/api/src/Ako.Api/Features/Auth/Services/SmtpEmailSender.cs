using Ako.Api.Infrastructure.Email;
using Ako.Api.Resources.Localization;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Ako.Api.Features.Auth;

/// <summary>"Email" ayar bölümü. Smtp.Host boşsa e-posta gönderilmez, kod log'a yazılır.</summary>
public sealed class EmailOptions
{
    public string FromAddress { get; set; } = "no-reply@ako.local";
    public string FromName { get; set; } = "Ako";
    public SmtpOptions Smtp { get; set; } = new();

    public sealed class SmtpOptions
    {
        public string? Host { get; set; }
        public int Port { get; set; } = 587;
        public string? UserName { get; set; }
        public string? Password { get; set; }

        /// <summary>Auto (port'a göre seçer), StartTls (587), SslOnConnect (465), None (yalnızca yerel test sunucuları).</summary>
        public SecureSocketOptions Security { get; set; } = SecureSocketOptions.Auto;
    }
}

/// <summary>
/// E-posta kodlarını SMTP ile gönderir (MailKit). Her SMTP sağlayıcısıyla çalışır: Gmail/Workspace,
/// Office 365, Amazon SES, Mailgun, Resend, Brevo… HTML Resources/EmailTemplates'ten, metinler isteğin dilinde
/// Resources/Localization/Messages*.resx'ten gelir.
/// </summary>
internal sealed class SmtpEmailSender(Microsoft.Extensions.Options.IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    : IAppEmailSender
{
    public async Task SendCodeAsync(string email, EmailCodePurpose purpose, string code, CancellationToken ct)
    {
        var settings = options.Value;
        var subject = Messages.Get($"email.{purpose}.subject");
        var values = new Dictionary<string, string>
        {
            ["appName"] = settings.FromName,
            ["subject"] = subject,
            ["intro"] = Messages.Get($"email.{purpose}.intro"),
            ["code"] = code,
            ["note"] = Messages.Get("email.code.note"),
            ["footer"] = Messages.Get("email.footer"),
        };

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;
        message.Body = new BodyBuilder
        {
            HtmlBody = EmailTemplates.Render("Code", values),
            // HTML göstermeyen istemciler için düz metin sürümü.
            TextBody = $"{values["intro"]}\n\n{code}\n\n{values["note"]}",
        }.ToMessageBody();

        using var client = new SmtpClient();
        // Host boşsa bu sınıf hiç kaydedilmez (bkz. AuthSetup), burada her zaman doludur.
        await client.ConnectAsync(settings.Smtp.Host!, settings.Smtp.Port, settings.Smtp.Security, ct);
        if (!string.IsNullOrEmpty(settings.Smtp.UserName))
        {
            await client.AuthenticateAsync(settings.Smtp.UserName, settings.Smtp.Password ?? "", ct);
        }

        await client.SendAsync(message, ct);
        await client.DisconnectAsync(quit: true, ct);
        logger.LogInformation("E-posta kodu ({Purpose}) gönderildi → {Email}", purpose, email);
    }
}
