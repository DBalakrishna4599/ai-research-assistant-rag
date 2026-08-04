import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import LoadingSpinner from './LoadingSpinner';
import { BookOpen, Cpu } from 'lucide-react';
import api from '../services/api';

export default function ChatWindow() {
  const { 
    chatHistory, 
    setChatHistory, 
    activeDocument, 
    loading, 
    setLoading 
  } = useApp();
  
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading.chat]);

  const handleSendMessage = async (userMessage) => {
    const userMessageId = Date.now().toString();
    const localizedUserMsg = {
      id: userMessageId,
      role: 'user',
      content: userMessage,
      document_id: activeDocument?.document_id || null
    };

    setChatHistory(prev => [...prev, localizedUserMsg]);
    setLoading(prev => ({ ...prev, chat: true }));

    try {
      const response = await api.post('/chat', {
        message: userMessage,
        document_id: activeDocument?.document_id || null
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources,
        document_id: activeDocument?.document_id || null
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("API failed to generate RAG response:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "An unexpected network or inference error occurred. Please verify your VM or Ollama status.",
        sources: [],
        document_id: activeDocument?.document_id || null
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };

  const filteredChatHistory = chatHistory.filter(msg => {
    if (!activeDocument) return true;
    return msg.document_id === activeDocument.document_id;
  });

  return (
    <div className="flex flex-col h-full flex-grow bg-[#07080b]">
      
      {/* Scrollable Conversation Workspace */}
      <div className="flex-grow overflow-y-auto py-6 px-4 space-y-4">
        {filteredChatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-36 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6 shadow-inner animate-pulse">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-sm tracking-tight mb-2">Interrogate Your Library</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              {activeDocument 
                ? `Ask questions about "${activeDocument.filename}". Answers will be extracted exclusively from its text contents.`
                : "Ask questions across your entire collection. Select individual documents on the sidebar to restrict query bounds."
              }
            </p>
          </div>
        ) : (
          filteredChatHistory.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Local Inference Loading Indicator */}
        {loading.chat && (
          <div className="flex w-full mt-6 space-x-3.5 max-w-4xl mx-auto px-4 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 shadow-md">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="bg-[#111218]/50 border border-[#16171f] rounded-2xl p-4 flex items-center space-x-3 text-xs text-zinc-400">
              <LoadingSpinner className="w-3.5 h-3.5 text-indigo-400" />
              <span>Analyzing context & running local inference...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomScrollRef} />
      </div>

      {/* Input Action Panel */}
      <ChatInput onSendMessage={handleSendMessage} />

    </div>
  );
}