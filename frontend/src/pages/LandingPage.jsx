import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { BookOpen, Shield, Cpu, Zap, X } from 'lucide-react';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(null); // 'signin' | 'signup' | null

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      title: "Strict Data Privacy",
      description: "Documents are partitioned per tenant. Your PDFs, extracted texts, and vectors are completely isolated from other users."
    },
    {
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
      title: "100% Local LLM",
      description: "Inference runs locally using Qwen 2.5 on a dedicated GCP instance via Ollama. No data is sent to external API providers."
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-500" />,
      title: "Precise RAG Pipeline",
      description: "Utilizes advanced BGE Small embeddings and local semantic similarity search to generate precise, context-bounded answers."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Research Assistant</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowAuthModal('signin')}
              className="text-sm font-medium text-textMuted hover:text-textMain transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => setShowAuthModal('signup')}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex-grow flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-surface border border-border px-3 py-1 rounded-full text-xs text-textMuted mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Qwen 2.5 Inference Active</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Intelligent Document Research, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
            Completely Private & Local.
          </span>
        </h1>

        <p className="mt-6 text-lg text-textMuted max-w-2xl leading-relaxed">
          Upload PDF whitepapers, reports, or research documents. Ask natural language questions and extract source-cited answers instantly. Powered by self-hosted local models.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button 
            onClick={() => setShowAuthModal('signup')}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-primary/30"
          >
            Create Free Account
          </button>
          <button 
            onClick={() => setShowAuthModal('signin')}
            className="w-full sm:w-auto bg-surface hover:bg-surface/80 border border-border font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Access Dashboard
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-surface border border-border p-8 rounded-2xl text-left hover:border-primary/30 transition-all group">
              <div className="bg-background w-12 h-12 rounded-xl flex items-center justify-center border border-border mb-6 group-hover:border-primary/20 transition-all">
                {feat.icon}
              </div>
              <h3 className="font-bold text-lg mb-3">{feat.title}</h3>
              <p className="text-textMuted text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 py-8 relative z-10 text-center text-xs text-textMuted">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} AI Research Assistant. Built with React, FastAPI, ChromaDB, and Qwen 2.5.</p>
        </div>
      </footer>

      {/* Embedded Clerk Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="relative max-w-md w-full bg-surface border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-background transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Render Clerk Component */}
            <div className="flex justify-center pt-4">
              {showAuthModal === 'signin' ? (
                <SignIn 
                  routing="hash"
                  signUpUrl="/#signup"
                  appearance={{
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: '#161820',
                      colorText: '#f3f4f6',
                      colorTextSecondary: '#9ca3af',
                      colorInputBackground: '#0d0e12',
                      colorInputText: '#f3f4f6',
                      colorBorder: '#252836'
                    },
                    elements: {
                      card: "shadow-none border-none bg-transparent p-0",
                      headerTitle: "text-textMain",
                      headerSubtitle: "text-textMuted",
                      socialButtonsBlockButton: "bg-background border border-border text-textMain hover:bg-background/80",
                      dividerText: "text-textMuted",
                      formFieldLabel: "text-textMain",
                      formFieldInput: "bg-background border-border text-textMain",
                      footerActionText: "text-textMuted",
                      footerActionLink: "text-primary hover:text-primary/95"
                    }
                  }}
                />
              ) : (
                <SignUp 
                  routing="hash"
                  signInUrl="/#signin"
                  appearance={{
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: '#161820',
                      colorText: '#f3f4f6',
                      colorTextSecondary: '#9ca3af',
                      colorInputBackground: '#0d0e12',
                      colorInputText: '#f3f4f6',
                      colorBorder: '#252836'
                    },
                    elements: {
                      card: "shadow-none border-none bg-transparent p-0",
                      headerTitle: "text-textMain",
                      headerSubtitle: "text-textMuted",
                      socialButtonsBlockButton: "bg-background border border-border text-textMain hover:bg-background/80",
                      dividerText: "text-textMuted",
                      formFieldLabel: "text-textMain",
                      formFieldInput: "bg-background border-border text-textMain",
                      footerActionText: "text-textMuted",
                      footerActionLink: "text-primary hover:text-primary/95"
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}