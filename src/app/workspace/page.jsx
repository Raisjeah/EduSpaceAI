'use client';

import { useState, useEffect } from 'react';
import {
  FolderKanban,
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Briefcase,
  Clock,
  Rocket,
  BookOpen
} from 'lucide-react';
import { getProjects, deleteProject } from '@/app/actions/projectActions';
import { getDocumentsByUser, deleteDocument } from '@/app/actions/documentActions';
import { useLayout } from '@/context/LayoutContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'documents'
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { setIsProjectModalOpen } = useLayout();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [projData, docData] = await Promise.all([
        getProjects(),
        getDocumentsByUser()
      ]);
      setProjects(projData);
      setDocuments(docData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(d =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProject = async (id) => {
    if (confirm('Arsip proyek ini? Proyek akan dihapus permanen setelah 30 hari.')) {
      const res = await deleteProject(id);
      if (res.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
      }
    }
  };

  const handleDeleteDoc = async (id) => {
    if (confirm('Hapus dokumen ini secara permanen?')) {
      const res = await deleteDocument(id);
      if (res.success) {
        setDocuments(prev => prev.filter(d => d._id !== id));
      }
    }
  };

  const getAgentIcon = (agentId) => {
    switch (agentId) {
      case 'deep-search': return <Search size={16} className="text-blue-400" />;
      case 'researcher': return <BookOpen size={16} className="text-green-400" />;
      case 'editor': return <Edit3 size={16} className="text-amber-400" />;
      default: return <Rocket size={16} className="text-indigo-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0F0F0F] overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="text-indigo-600" /> Workspace
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">Kelola semua proyek riset dan dokumen akademik Anda di sini.</p>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={() => setIsProjectModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
             >
               <Plus size={18} /> Proyek Baru
             </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
           <div className="flex bg-white dark:bg-[#151515] p-1 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FolderKanban size={16} /> Proyek ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FileText size={16} /> Dokumen ({documents.length})
              </button>
           </div>

           <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Cari ${activeTab === 'projects' ? 'proyek' : 'dokumen'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all shadow-sm"
              />
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-8">
        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
             >
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="h-48 bg-white dark:bg-[#151515] rounded-3xl animate-pulse border border-slate-100 dark:border-white/5" />
               ))}
             </motion.div>
          ) : activeTab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.length === 0 ? (
                <EmptyState icon={<FolderKanban size={48} />} message="Tidak ada proyek ditemukan." />
              ) : (
                filteredProjects.map(project => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onDelete={() => handleDeleteProject(project._id)}
                    icon={getAgentIcon(project.agentId)}
                  />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredDocuments.length === 0 ? (
                <EmptyState icon={<FileText size={48} />} message="Tidak ada dokumen ditemukan." />
              ) : (
                filteredDocuments.map(doc => (
                  <DocumentRow
                    key={doc._id}
                    doc={doc}
                    onDelete={() => handleDeleteDoc(doc._id)}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProjectCard({ project, onDelete, icon }) {
  return (
    <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-100 dark:border-white/5">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate pr-8">{project.name}</h3>
      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-6">{project.agentId.replace('-', ' ')}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Clock size={14} /> {new Date(project.createdAt).toLocaleDateString('id-ID')}
        </div>
        <Link
          href={`/chat/${project._id}?projectId=${project._id}`}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
        >
          Buka <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function DocumentRow({ doc, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 shrink-0">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.fileName}</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            {doc.fileType.split('/')[1] || 'FILE'} • {new Date(doc.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/tools?docId=${doc._id}`}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all"
          title="Buka di Editor"
        >
          <ExternalLink size={18} />
        </Link>
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
          title="Hapus Dokumen"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-[#151515] rounded-3xl flex items-center justify-center text-slate-300 mb-4 border border-slate-200 dark:border-white/5">
        {icon}
      </div>
      <p className="text-slate-500 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}
