import { FileText, BookOpen, FileSpreadsheet, BrainCircuit, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ToolsView() {
  const tools = [
    { id: 'pdf', title: 'Edit & Analisis PDF', icon: <FileText size={24} className="text-red-400" />, desc: 'Ekstrak teks PDF ke dalam editor lalu analisis.' },
    { id: 'doc', title: 'Edit & Analisis DOC', icon: <BookOpen size={24} className="text-blue-400" />, desc: 'Buka dokumen teks, edit manual, minta saran AI.' },
    { id: 'xls', title: 'Data Excel / CSV', icon: <FileSpreadsheet size={24} className="text-green-400" />, desc: 'Upload CSV, edit data, dan buat kesimpulan.' },
    { id: 'skripsi', title: 'Asisten Skripsi', icon: <BrainCircuit size={24} className="text-indigo-400" />, desc: 'AI akan bertindak sebagai Dosen Pembimbing.' },
    { id: 'soal', title: 'Generator Soal', icon: <Edit3 size={24} className="text-amber-400" />, desc: 'Buat soal kuis dari materi yang kamu miliki.' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar transition-colors duration-200">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Workspace & Tools</h2>
      <p className="text-[12px] text-slate-500 dark:text-gray-400 mb-8">Pilih tipe file untuk masuk ke Dashboard Editor, atau gunakan fitur asisten akademik.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <Link
            key={tool.id} 
            href={`/editor/${tool.id}`}
            className="bg-slate-50 dark:bg-[#242424] p-5 rounded-[1.5rem] border border-slate-200 dark:border-[#333] hover:border-indigo-500/50 cursor-pointer transition-all group block"
          >
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-transparent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              {tool.icon}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-gray-200 text-sm mb-2">{tool.title}</h3>
            <p className="text-[10px] text-slate-500 dark:text-gray-500 leading-relaxed">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
