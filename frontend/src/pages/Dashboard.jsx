import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function Dashboard() {
  const { fetchDocuments, fetchChatHistory } = useApp();

  useEffect(() => {
    // Parallel fetch document portfolio and query records on initial mount
    fetchDocuments();
    fetchChatHistory();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex flex-grow overflow-hidden">
        
        {/* Left Side Library Manager */}
        <Sidebar />

        {/* Right Side Chat Interface */}
        <main className="flex-grow flex flex-col bg-background relative">
          <ChatWindow />
        </main>

      </div>
    </div>
  );
}