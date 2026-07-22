import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export const ConversationContext = createContext(null);

const STORAGE_KEY = 'hacksprint_active_conversation_id';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/v1\/?$/, '') 
  : 'http://localhost:5000/api';

export function ConversationProvider({ children }) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [chatHistory, setChatHistory] = useState([]);
  const [fields, setFields] = useState({
    company: null,
    role: null,
    experience: null,
    skills: [],
    technologies: [],
    interviewTypes: [],
    seniority: null,
  });
  const [completed, setCompleted] = useState(false);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [generatedQueries, setGeneratedQueries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentStep, setCurrentStep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore session from Firestore on refresh
  const reloadSession = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/agent/session/${id}`);
      if (res.data?.conversation) {
        const conv = res.data.conversation;
        setConversationId(conv.id);
        setChatHistory(conv.chatHistory || []);
        setFields(conv.fields || {});
        setCompleted(!!res.data.completed);
        const lastMsg = (conv.chatHistory || []).slice().reverse().find(m => m.role === 'assistant');
        if (lastMsg && !res.data.completed) {
          setNextQuestion(lastMsg.content);
        }
      }
    } catch (err) {
      console.warn('[ConversationSession Restore Note]:', err?.response?.data || err.message);
      localStorage.removeItem(STORAGE_KEY);
      setConversationId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      reloadSession(savedId);
    }
  }, [reloadSession]);

  /**
   * Send single request to POST /api/agent/message.
   * Backend automatically handles Conversation -> Queries -> Multi-source Search -> AI Analysis -> Dashboard payload.
   */
  const sendMessage = async (messageText) => {
    if (!messageText || !messageText.trim()) return null;

    const trimmedMsg = messageText.trim();
    setError(null);
    setLoading(true);
    setCurrentStep('Extracting interview criteria...');

    // Optimistically push user message to local history
    const tempUserMsg = { role: 'user', content: trimmedMsg, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, tempUserMsg]);

    try {
      const payload = {
        message: trimmedMsg,
        conversationId: conversationId || undefined,
        userId: user?.uid || null,
      };

      const res = await axios.post(`${API_BASE_URL}/agent/message`, payload);
      const data = res.data;

      const activeId = data.conversationId || data.conversation?.id;
      if (activeId) {
        setConversationId(activeId);
        localStorage.setItem(STORAGE_KEY, activeId);
      }

      if (data.conversation) {
        setChatHistory(data.conversation.chatHistory || []);
        setFields(data.conversation.fields || data.profile || {});
      } else if (data.profile) {
        setFields(data.profile);
      }

      setCompleted(!!data.completed);

      if (!data.completed) {
        // Step 1: Still collecting criteria
        if (data.nextQuestion) {
          setNextQuestion(data.nextQuestion);
        }
      } else {
        // Step 2: Criteria complete! Master workflow orchestrator executed
        setNextQuestion(null);
        if (data.analysis) {
          setAnalysisResults(data.analysis);
        }
        if (data.questions) {
          setSearchResults(data.questions);
        }
        setCurrentStep('Dashboard ready!');
      }

      return data;
    } catch (err) {
      console.error('[sendMessage Agent Error]:', err);
      const fallback = "I'm having trouble processing your request. Could you try again?";
      setError(fallback);
      setNextQuestion(fallback);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: fallback, timestamp: new Date().toISOString() },
      ]);
      return null;
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const resetConversation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setChatHistory([]);
    setFields({
      company: null,
      role: null,
      experience: null,
      skills: [],
      technologies: [],
      interviewTypes: [],
      seniority: null,
    });
    setCompleted(false);
    setNextQuestion(null);
    setGeneratedQueries([]);
    setSearchResults([]);
    setAnalysisResults(null);
    setCurrentStep('');
    setError(null);
  };

  const value = {
    conversationId,
    chatHistory,
    fields,
    completed,
    nextQuestion,
    generatedQueries,
    searchResults,
    analysisResults,
    currentStep,
    loading,
    error,
    sendMessage,
    resetConversation,
    reloadSession,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}
