import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Cpu, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex w-full mt-6 space-x-3.5 max-w-4xl mx-auto px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {/* Bot Icon */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 shadow-md">
          <Cpu className="w-4 h-4 text-indigo-400" />
        </div>
      )}

      {/* Speech Block Bubble */}
      <div className={`max-w-[85%] rounded-2xl p-4.5 border transition-all ${
        isUser 
          ? 'bg-indigo-600/10 border-indigo-500/20 text-white' 
          : 'bg-[#111218]/50 border-[#16171f] text-[#f3f4f6]'
      }`}>
        {isUser ? (
          <p className="text-xs leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            
            {/* Cite Block Accordion */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#16171f]">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showSources ? 'Hide Sources' : `Show Sources (${message.sources.length})`}</span>
                  {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showSources && (
                  <div className="grid grid-cols-1 gap-2 mt-3 transition-all animate-in slide-in-from-top-1 duration-200">
                    {message.sources.map((source, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-xl bg-[#07080b] border border-[#16171f] text-[10px] flex flex-col space-y-2"
                      >
                        <div className="flex items-center justify-between font-bold text-zinc-500">
                          <span className="truncate max-w-[200px]">{source.filename}</span>
                          <span className="bg-[#111218] border border-[#16171f] px-1.5 py-0.5 rounded text-[8px] text-indigo-400">
                            Page {source.page_number}
                          </span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed italic border-l-2 border-indigo-500/40 pl-2.5">
                          "{source.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-[#111218] border border-[#1e202c] flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-4 h-4 text-zinc-400" />
        </div>
      )}

    </div>
  );
}