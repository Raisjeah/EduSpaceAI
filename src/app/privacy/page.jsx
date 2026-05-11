import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-[#0F0F0F]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-slate-900 dark:text-white">Kebijakan Privasi</h1>

        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
          <p>EduSpaceAI sangat menghargai privasi dan keamanan data Anda. Berikut adalah kebijakan kami terkait data user:</p>

          <h2>1. Data yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan saat pendaftaran (seperti nama dan email via Google Auth) serta dokumen atau teks yang Anda masukkan ke dalam platform untuk keperluan analisis AI.
          </p>

          <h2>2. Kebijakan Data User (Non-Training)</h2>
          <p>
            <strong>Kami tidak menggunakan data penelitian, dokumen, atau percakapan Anda untuk melatih (training) model AI kami.</strong> Data Anda adalah milik Anda sepenuhnya. Kami hanya bertindak sebagai fasilitator pemrosesan data menggunakan API pihak ketiga (Google & Anthropic) dengan standar keamanan tinggi.
          </p>

          <h2>3. Keamanan Data</h2>
          <p>
            Semua data disimpan menggunakan enkripsi tingkat industri dan hanya dapat diakses oleh Anda melalui sistem otentikasi resmi. Kami tidak membagikan data Anda kepada pihak ketiga selain untuk keperluan operasional inti (seperti pemrosesan pembayaran via Midtrans).
          </p>

          <h2>4. Hak Anda</h2>
          <p>
            Anda memiliki hak penuh untuk mengakses, mengubah, atau meminta penghapusan permanen seluruh data Anda dari server kami kapan saja melalui pengaturan profil.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Kami menggunakan cookies fungsional untuk menjaga sesi login Anda tetap aman. Kami tidak menggunakan cookies untuk pelacakan iklan pihak ketiga.
          </p>

          <hr className="my-12 border-slate-200 dark:border-[#1E1E1E]" />

          <section id="contact" className="not-prose">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2A2A2A]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Hubungi Pengembang</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-6">Pertanyaan tentang data Anda? Developer support kami siap membantu menjelaskan secara transparan.</p>
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
