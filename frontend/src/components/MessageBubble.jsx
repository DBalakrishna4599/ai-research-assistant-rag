import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Cpu, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex w-full mt-6 space-x-3 max-w-4xl mx-auto px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {/* Sender Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
      )}

      {/* Message Content Bubble */}
      <div className={`max-w-[85%] rounded-2xl p-4 border ${
        isUser 
          ? 'bg-primary/10 border-primary/20 text-textMain' 
          : 'bg-surface/50 border-border text-textMain'
      }`}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            
            {/* Source Citations Accordion (Displays if sources payload was passed or generated) */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center space-x-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showSources ? 'Hide Sources' : `Show Sources (${message.sources.length})`}</span>
                  {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showSources && (
                  <div className="grid grid-cols-1 gap-2 mt-2 transition-all">
                    {message.sources.map((source, index) => (
                      <div 
                        key={index} 
                        className="p-2.5 rounded-lg bg-background border border-border text-xs flex flex-col space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-zinc-400">
                          <span className="truncate max-w-[200px]">{source.filename}</span>
                          <span className="bg-surface px-1.5 py-0.5 rounded text-[10px] text-zinc-500">
                            Page {source.page_number}
                          </span>
                        </div>
                        <p className="text-zinc-500 italic line-clamp-2">
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
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-zinc-400" />
        </div>
      )}

    </div>
  );
}