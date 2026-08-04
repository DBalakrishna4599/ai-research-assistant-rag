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

  // Auto-scroll logic triggered on update of message log or chat loading state
  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading.chat]);

  const handleSendMessage = async (userMessage) => {
    // 1. Instantly append User's message locally to provide immediate feedback
    const userMessageId = Date.now().toString();
    const localizedUserMsg = {
      id: userMessageId,
      role: 'user',
      content: userMessage,
      document_id: activeDocument?.document_id || null
    };

    setChatHistory(prev => [...prev, localizedUserMsg]);
    setLoading(prev => ({ ...prev, chat: true }));

    // 2. Submit payload to FastAPI RAG Endpoint
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

  // Filter local conversation threads to match the selected active PDF target context
  const filteredChatHistory = chatHistory.filter(msg => {
    if (!activeDocument) return true; // Show all messages if querying the whole library
    return msg.document_id === activeDocument.document_id;
  });

  return (
    <div className="flex flex-col h-full flex-grow bg-background">
      
      {/* Scrollable Conversation Workspace */}
      <div className="flex-grow overflow-y-auto py-6 px-4 space-y-4">
        {filteredChatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-24 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Interrogate Your Library</h3>
            <p className="text-sm text-textMuted leading-relaxed">
              {activeDocument 
                ? `Ask questions about ${activeDocument.filename}. Answers will be extracted exclusively from its text contents.`
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
          <div className="flex w-full mt-6 space-x-3 max-w-4xl mx-auto px-4 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="bg-surface/50 border border-border rounded-2xl p-4 flex items-center space-x-3 text-sm text-textMuted">
              <LoadingSpinner className="w-4 h-4 text-indigo-400" />
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