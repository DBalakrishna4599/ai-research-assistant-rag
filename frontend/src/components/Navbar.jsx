import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { activeDocument } = useApp();

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between z-20">
      
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-lg hidden sm:inline-block">AI Research Assistant</span>
      </div>

      {/* Query Target Context Badge */}
      <div className="flex items-center max-w-xs sm:max-w-md md:max-w-lg truncate">
        {activeDocument ? (
          <div className="flex items-center space-x-2 bg-primary/10 border border-primary/20 text-indigo-400 px-3 py-1 rounded-full text-xs truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="font-medium truncate">Context: {activeDocument.filename}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-zinc-800/50 border border-zinc-700/30 text-zinc-400 px-3 py-1 rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="font-medium">Context: All Library Documents</span>
          </div>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <a 
          href="https://ollama.com" 
          target="_blank" 
          rel="noreferrer" 
          className="text-textMuted hover:text-textMain transition-colors hidden sm:block"
        >
          <HelpCircle className="w-5 h-5" />
        </a>
        
        {/* Clerk Profile & Logout Dropdown */}
        <div className="flex items-center justify-center border border-border p-1 rounded-full bg-background">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              variables: {
                colorBackground: '#161820',
                colorText: '#f3f4f6',
                colorTextSecondary: '#9ca3af'
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}