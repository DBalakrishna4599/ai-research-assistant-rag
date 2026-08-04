import React, { useState } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ChatInput({ onSendMessage }) {
  const [text, setText] = useState('');
  const { loading } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !loading.chat) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 border-t border-border bg-surface/30 backdrop-blur-md"
    >
      <div className="max-w-4xl mx-auto relative flex items-center bg-surface border border-border rounded-xl focus-within:border-primary/50 transition-all p-1.5 shadow-xl">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          rows={1}
          disabled={loading.chat}
          className="flex-grow bg-transparent border-0 outline-none resize-none text-sm text-textMain placeholder-zinc-500 py-3 px-4 max-h-32 min-h-[1.5rem] disabled:cursor-not-allowed"
        />
        
        <button
          type="submit"
          disabled={!text.trim() || loading.chat}
          className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white p-3 rounded-lg transition-all disabled:opacity-35 disabled:hover:bg-primary disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-zinc-600 text-center mt-2">
        Inference is computed locally on Google Cloud via Qwen 2.5. Answers are constrained strictly to source context.
      </p>
    </form>
  );
}