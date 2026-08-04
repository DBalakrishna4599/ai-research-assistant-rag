import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, FileText, Trash2, Globe, Database } from 'lucide-react';
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
    <aside className="w-80 border-r border-border bg-background/50 flex flex-col justify-between h-[calc(100vh-4rem)]">
      
      {/* Scrollable Document Catalog */}
      <div className="flex-grow flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-textMuted uppercase tracking-wider">My PDF Library</span>
          <span className="text-xs bg-surface border border-border text-textMuted px-2 py-0.5 rounded-full">
            {documents.length} Files
          </span>
        </div>

        {/* Global Context Target Option */}
        <button
          onClick={() => setActiveDocument(null)}
          className={`flex items-center space-x-3 w-full p-3 rounded-xl border text-left transition-all mb-4 ${
            activeDocument === null 
              ? 'bg-primary/10 border-primary/30 text-textMain shadow-md shadow-primary/5' 
              : 'bg-surface/30 border-border text-textMuted hover:border-zinc-700 hover:text-textMain'
          }`}
        >
          <Globe className={`w-5 h-5 ${activeDocument === null ? 'text-primary' : 'text-textMuted'}`} />
          <div className="flex-grow min-w-0">
            <h4 className="font-semibold text-sm truncate">Query Entire Library</h4>
            <p className="text-xs text-textMuted truncate">Searches across all documents</p>
          </div>
        </button>

        {/* List of uploaded documents */}
        <div className="space-y-2 flex-grow overflow-y-auto pr-1">
          {documents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl px-4">
              <Database className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-textMuted">No documents found.</p>
              <p className="text-xs text-zinc-600 mt-1">Upload a PDF to begin researching.</p>
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = activeDocument?.document_id === doc.document_id;
              return (
                <div 
                  key={doc.document_id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                    isSelected 
                      ? 'bg-surface border-primary/30 text-textMain' 
                      : 'bg-surface/20 border-border hover:border-zinc-700 text-textMuted'
                  }`}
                >
                  <button
                    onClick={() => setActiveDocument(doc)}
                    className="flex items-center space-x-3 min-w-0 flex-grow text-left"
                  >
                    <FileText className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-textMuted'}`} />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium truncate group-hover:text-textMain transition-colors">
                        {doc.filename}
                      </h4>
                      <p className="text-xs text-zinc-600">
                        {new Date(doc.upload_time * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  
                  {/* Delete button (displays on hover) */}
                  <button
                    onClick={() => deleteDocument(doc.document_id)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ml-2"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Tray Bottom Section */}
      <div className="p-4 border-t border-border bg-surface/30">
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
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {loading.upload ? (
            <>
              <LoadingSpinner className="w-5 h-5 text-white" />
              <span>Processing PDF...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Upload PDF</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}