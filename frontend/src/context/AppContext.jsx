import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState({
    documents: false,
    chat: false,
    upload: false
  });

  const fetchDocuments = async () => {
    setLoading(prev => ({ ...prev, documents: true }));
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/chat/history');
      setChatHistory(response.data);
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  const uploadDocument = async (file) => {
    setLoading(prev => ({ ...prev, upload: true }));
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchDocuments();
      return response.data;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const deleteDocument = async (docId) => {
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc.document_id !== docId));
      if (activeDocument?.document_id === docId) {
        setActiveDocument(null);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      documents,
      activeDocument,
      setActiveDocument,
      chatHistory,
      setChatHistory,
      loading,
      setLoading,
      fetchDocuments,
      fetchChatHistory,
      uploadDocument,
      deleteDocument
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be accessed within an AppProvider wrapper");
  }
  return context;
};