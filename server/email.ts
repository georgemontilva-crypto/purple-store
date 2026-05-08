import nodemailer from "nodemailer";

/**
 * Crea un transporter de nodemailer.
 * Usa las variables de entorno SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
 * Si no están configuradas, usa Ethereal (cuenta de prueba) en desarrollo.
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }

  // Fallback: cuenta de prueba Ethereal (solo dev)
  const testAccount = await nodemailer.createTestAccount();
  console.log("[Email] Using Ethereal test account:", testAccount.user);
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  pin: string
): Promise<{ previewUrl?: string }> {
  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM ?? `"BoraHae Art" <noreply@borahae.art>`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifica tu cuenta - BoraHae Art</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(93,0,200,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3d1a8c 0%,#7c3aed 60%,#a78bfa 100%);padding:36px 40px 28px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:12px;">
                <span style="font-size:28px;">🎨</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">BoraHae Art</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Arte Anime Hecho a Mano</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <h2 style="margin:0 0 8px;color:#1e1b4b;font-size:20px;font-weight:800;">¡Hola, ${name}! 👋</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Gracias por registrarte en <strong>BoraHae Art</strong>. Para activar tu cuenta, ingresa el siguiente código de verificación:
              </p>
              <!-- PIN -->
              <div style="background:linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%);border:2px solid #c4b5fd;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Tu código de verificación</p>
                <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#3d1a8c;font-family:'Courier New',monospace;">${pin}</div>
                <p style="margin:10px 0 0;color:#9ca3af;font-size:12px;">Este código expira en <strong>15 minutos</strong></p>
              </div>
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
                Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#faf5ff;padding:20px 40px;border-top:1px solid #ede9fe;text-align:center;">
              <p style="margin:0;color:#a78bfa;font-size:12px;">© 2025 BoraHae Art · Arte Anime Hecho a Mano</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const info = await transporter.sendMail({
    from,
    to,
    subject: `${pin} es tu código de verificación - BoraHae Art`,
    html,
    text: `Hola ${name},\n\nTu código de verificación para BoraHae Art es: ${pin}\n\nEste código expira en 15 minutos.\n\nSi no creaste esta cuenta, ignora este correo.`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  if (previewUrl) {
    console.log("[Email] Preview URL:", previewUrl);
  }

  return { previewUrl: previewUrl || undefined };
}
