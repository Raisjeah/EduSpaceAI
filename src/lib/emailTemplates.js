export function getOtpTemplate(otp) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin-bottom: 8px;">EduSpaceAI</h1>
        <p style="color: #64748b; font-size: 16px;">Verifikasi Akun Anda</p>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 6px; text-align: center;">
        <p style="margin-bottom: 16px; color: #334155;">Berikut adalah kode verifikasi (OTP) Anda:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b; margin-bottom: 16px;">${otp}</div>
        <p style="font-size: 14px; color: #64748b;">Kode ini akan kadaluwarsa dalam 5 menit.</p>
      </div>
      <div style="margin-top: 24px; font-size: 14px; color: #94a3b8; text-align: center;">
        Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.
      </div>
    </div>
  `;
}

export function getWelcomeTemplate(name) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #4f46e5; margin-bottom: 8px;">EduSpaceAI</h1>
        <p style="color: #64748b; font-size: 18px;">Selamat Datang di Masa Depan Akademik!</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">Halo <strong>${name}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.6;">Selamat datang di EduSpaceAI! Kami sangat senang Anda bergabung dalam perjalanan untuk meningkatkan produktivitas akademik Anda. Akun Anda telah berhasil diverifikasi dan sekarang Anda siap untuk mengeksplorasi semua fitur unggulan kami.</p>

      <div style="margin: 32px 0;">
        <h3 style="color: #4f46e5; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Fitur Utama Untuk Anda:</h3>

        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 4px 0; color: #1e293b;">🚀 Deep Search Agent</h4>
          <p style="margin: 0; font-size: 14px; color: #64748b;">Lakukan riset mendalam dengan bantuan AI yang mampu menganalisis ribuan sumber secara otomatis.</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 4px 0; color: #1e293b;">📚 Bimbingan Skripsi & Riset</h4>
          <p style="margin: 0; font-size: 14px; color: #64748b;">Dapatkan pendampingan dalam menyusun skripsi, tesis, atau jurnal dari tahap awal hingga final.</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 4px 0; color: #1e293b;">💻 Coding & IT Assistant</h4>
          <p style="margin: 0; font-size: 14px; color: #64748b;">Bantuan teknis untuk proyek pemrograman dan analisis data Anda.</p>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; margin-top: 32px;">
        <h4 style="margin-top: 0; color: #1e293b;">Butuh Bantuan?</h4>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">
          Untuk bantuan teknis atau jika Anda ingin mengaktifkan instruksi Verifikasi 2 Langkah (2-Step Verification) tingkat lanjut pada akun Anda, silakan hubungi tim admin kami kapan saja melalui email resmi di: <a href="mailto:eduspaceai@gmail.com" style="color: #4f46e5; text-decoration: none; font-weight: bold;">eduspaceai@gmail.com</a>.
        </p>
      </div>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} EduSpaceAI. Hak Cipta Dilindungi.
      </div>
    </div>
  `;
}
