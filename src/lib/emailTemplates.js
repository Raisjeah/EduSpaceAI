export const otpEmailTemplate = (otpCode) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { text-align: center; margin-bottom: 30px; }
    .otp-code { font-size: 32px; font-weight: 700; color: #4F46E5; letter-spacing: 5px; text-align: center; padding: 20px; background: #EEF2FF; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #6B7280; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #111827;">Verifikasi Akun Eduspace AI</h1>
      <p style="color: #4B5563;">Gunakan kode berikut untuk memverifikasi akun Anda.</p>
    </div>
    <div class="otp-code">${otpCode}</div>
    <p style="color: #4B5563; font-size: 14px; text-align: center;">Kode ini akan kedaluwarsa dalam 10 menit.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Eduspace AI. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 40px; border-radius: 12px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .feature { margin-bottom: 20px; padding: 15px; background: #F9FAFB; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #111827;">Selamat Datang, ${userName}!</h1>
    <p style="color: #4B5563;">Akun Anda telah berhasil diverifikasi. Kini Anda dapat mengakses seluruh fitur unggulan Eduspace AI untuk menunjang produktivitas akademik Anda.</p>

    <div class="feature">
      <h3 style="margin-top:0; color: #4F46E5;">🚀 Deep Search Agent</h3>
      <p style="margin-bottom:0; font-size: 14px; color: #374151;">Riset mendalam untuk skripsi dan jurnal dengan dukungan AI yang menganalisis ribuan sumber dalam sekejap.</p>
    </div>

    <div class="feature">
      <h3 style="margin-top:0; color: #10B981;">🎓 Bimbingan Skripsi & Riset</h3>
      <p style="margin-bottom:0; font-size: 14px; color: #374151;">Dapatkan arahan, struktur penulisan, dan validasi metodologi penelitian Anda secara instan.</p>
    </div>

    <div class="feature">
      <h3 style="margin-top:0; color: #F59E0B;">💻 Coding & IT Assistant</h3>
      <p style="margin-bottom:0; font-size: 14px; color: #374151;">Bantuan debugging, penjelasan algoritma, hingga pembuatan snippet kode untuk proyek IT Anda.</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://eduspace.ai" class="btn">Mulai Eksplorasi Sekarang</a>
    </div>

    <p style="color: #6B7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
      Catatan: Jika Anda mengalami kendala login, pastikan Anda telah mengaktifkan 2-Step Verification pada perangkat utama Anda.
    </p>
    <p style="color: #6B7280; font-size: 12px;">Email ini dikirim dari eduspaceai@gmail.com</p>
  </div>
</body>
</html>
`;
