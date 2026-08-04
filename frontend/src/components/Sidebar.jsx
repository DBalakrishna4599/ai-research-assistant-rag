import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, FileText, Trash2, Globe, Database, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function Sidebar() {
  const { 
    documents, 
    activeDocument, 
    setActiveDocument, 
    deleteDocument, 
    uploadDocument, 
    loading 
  } = useApp();
  
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadDocument(file);
      } catch (err) {
        alert("Upload failed. Ensure document is a valid uncorrupted PDF.");
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside className="w-80 border-r border-[#16171f] bg-[#090a0f] flex flex-col justify-between h-[calc(100vh-4rem)]">
      
      {/* Scrollable File List Container */}
      <div className="flex-grow flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Catalog</span>
          <span className="text-[10px] bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
            {documents.length} Files
          </span>
        </div>

        {/* Option: Query Entire Library */}
        <button
          onClick={() => setActiveDocument(null)}
          className={`flex items-center space-x-3 w-full p-3.5 rounded-xl border text-left transition-all mb-4 ${
            activeDocument === null 
              ? 'bg-indigo-500/10 border-indigo-500/20 text-white shadow-lg shadow-indigo-600/5' 
              : 'bg-[#111218]/30 border-[#16171f] text-zinc-400 hover:border-[#1e202c] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeDocument === null ? 'bg-indigo-500/20' : 'bg-zinc-900'}`}>
            <Globe className={`w-4 h-4 ${activeDocument === null ? 'text-indigo-400' : 'text-zinc-500'}`} />
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-semibold text-xs truncate">Query Entire Library</h4>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">Unified search across all files</p>
          </div>
        </button>

        {/* Segmented Divider */}
        <div className="border-t border-[#16171f] my-2" />

        {/* Document Cards */}
        <div className="space-y-2 flex-grow overflow-y-auto pr-1 mt-2">
          {documents.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#16171f] rounded-2xl px-4 bg-[#111218]/10">
              <Database className="w-7 h-7 text-zinc-700 mx-auto mb-3" />
              <p className="text-xs font-semibold text-zinc-400">Library is empty</p>
              <p className="text-[10px] text-zinc-600 mt-1 max-w-[160px] mx-auto leading-relaxed">
                Import a research paper or resume to begin.
              </p>
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = activeDocument?.document_id === doc.document_id;
              return (
                <div 
                  key={doc.document_id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group ${
                    isSelected 
                      ? 'bg-[#111218] border-indigo-500/20 text-white shadow-lg shadow-indigo-600/5' 
                      : 'bg-transparent border-[#16171f] hover:border-[#1e202c] text-zinc-400 hover:bg-[#111218]/20'
                  }`}
                >
                  <button
                    onClick={() => setActiveDocument(doc)}
                    className="flex items-center space-x-3 min-w-0 flex-grow text-left"
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${isSelected ? 'bg-indigo-500/20' : 'bg-zinc-900/40'}`}>
                      <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-xs font-semibold truncate group-hover:text-white transition-colors">
                        {doc.filename}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-[9px] text-zinc-500 mt-1">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        <span>{new Date(doc.upload_time * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete Option */}
                  <button
                    onClick={() => deleteDocument(doc.document_id)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ml-2"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Tray Container */}
      <div className="p-4 border-t border-[#16171f] bg-[#111218]/30">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf" 
          className="hidden" 
        />
        <button
          onClick={handleUploadClick}
          disabled={loading.upload}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10 border border-indigo-500/20 active:scale-95"
        >
          {loading.upload ? (
            <>
              <LoadingSpinner className="w-4 h-4 text-white" />
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}