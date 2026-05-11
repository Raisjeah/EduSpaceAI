import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-[#0F0F0F]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-slate-900 dark:text-white">Syarat & Ketentuan</h1>

        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
          <p>Selamat datang di EduSpaceAI. Dengan menggunakan layanan kami, Anda menyetujui persyaratan berikut:</p>

          <h2>1. Penerimaan Layanan</h2>
          <p>
            EduSpaceAI menyediakan alat bantu riset berbasis kecerdasan buatan. Layanan ini dimaksudkan untuk mendukung, bukan menggantikan, proses berpikir kritis dan tanggung jawab akademik pengguna.
          </p>

          <h2>2. Disclaimer Akurasi AI</h2>
          <p>
            Meskipun kami menggunakan model AI tercanggih (Gemini & Claude), teknologi AI dapat menghasilkan informasi yang kurang akurat atau "halusinasi". Pengguna bertanggung jawab penuh untuk melakukan verifikasi ulang terhadap setiap output, kutipan, dan referensi yang dihasilkan oleh EduSpaceAI sebelum dimasukkan ke dalam karya ilmiah.
          </p>

          <h2>3. Integritas Akademik</h2>
          <p>
            EduSpaceAI berkomitmen pada kejujuran akademik. Kami mendorong pengguna untuk menggunakan platform ini sebagai alat brainstorming, pencarian referensi, dan perbaikan tata bahasa. Penggunaan EduSpaceAI untuk melakukan plagiarisme atau kecurangan akademik di luar kebijakan institusi pendidikan masing-masing adalah tanggung jawab penuh pengguna.
          </p>

          <h2>4. Pembayaran & Langganan (Midtrans)</h2>
          <p>
            Semua transaksi diproses secara aman melalui Midtrans. Langganan yang telah dibayar tidak dapat dibatalkan atau di-refund kecuali terjadi kesalahan teknis pada sistem kami yang menyebabkan layanan tidak dapat diakses dalam waktu lama.
          </p>

          <h2>5. Perubahan Ketentuan</h2>
          <p>
            Kami dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui dashboard atau email resmi.
          </p>

          <hr className="my-12 border-slate-200 dark:border-[#1E1E1E]" />

          <section id="contact" className="not-prose">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2A2A2A]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Hubungi Pengembang</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-6">Memiliki pertanyaan terkait syarat dan ketentuan? Kami siap membantu.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:eduspaceai@gmail.com"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-center"
                >
                  Email Support
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  className="px-6 py-3 bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2A2A2A] rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#252525] transition-all text-center"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
}
