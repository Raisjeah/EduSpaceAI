'use client';

import { useState, useTransition } from 'react';
import { X, FolderOpen, BrainCircuit } from 'lucide-react';
import { saveDocument } from '@/app/actions/documentActions';
import { saveChat } from '@/app/actions/chatActions';
import { extractFileContent } from '@/app/actions/fileActions'; // server action
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DocumentEditor({ type, userId }) {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Belum ada file diunggah');
  const [fileType, setFileType] = useState('text/plain');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setFileType(file.type || 'text/plain');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    const result = await extractFileContent(formData);

    if (result.success) {
      setContent(result.content);
    } else {
      setContent(`Gagal ekstrak file: ${result.error}`);
    }
    setIsLoading(false);
  };

  const handleAnalyze = async () => {
    if (!content) return;
    const chatId = `chat_${Date.now()}`;
    await saveDocument(userId, fileName, fileType, content);
    await saveChat('user', `Tolong analisis dan perbaiki isi dokumen ini (${fileName}):\n\n${content}`, userId, chatId);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#1A1A1A]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <BrainCircuit size={18} className="text-indigo-400" /> Dashboard Editor {type}
          </h2>
          <p className="text-[11px] text-gray-500">Unggah file, edit isinya di sini, lalu klik Analisis.</p>
        </div>
        <Link href="/tools" className="text-gray-400 hover:text-white"><X size={20}/></Link>
      </div>

      <div className="flex gap-2 mb-4 bg-[#242424] p-2 rounded-xl border border-[#333]">
        <label className="flex items-center gap-2 bg-[#333] hover:bg-[#444] px-4 py-2 rounded-lg cursor-pointer transition-colors text-[11px] font-bold">
          <FolderOpen size={14} /> Buka File
          <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.csv,.md,.json,.pdf,.doc,.docx" />
        </label>
        <span className="my-auto text-[11px] text-gray-500 px-2 truncate max-w-[200px]">{fileName}</span>
        {isLoading && <span className="text-xs text-indigo-400">Mengekstrak...</span>}
        <div className="flex-1"></div>
        <button onClick={handleAnalyze} disabled={!content} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-[11px] font-bold disabled:opacity-50">
          <BrainCircuit size={14} /> Analisis dengan AI
        </button>
      </div>

      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Isi dokumen akan muncul di sini. Kamu bisa mengetik dan mengeditnya secara manual sebelum dianalisis oleh Profesor AI..."
        className="flex-1 bg-[#242424] border border-[#333] rounded-[1.5rem] p-6 text-[13px] text-gray-300 font-mono leading-relaxed outline-none focus:border-indigo-500/50 resize-none custom-scrollbar"
      />
    </div>
  );
}
