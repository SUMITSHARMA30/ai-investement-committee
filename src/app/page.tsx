"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Send,
  Plus,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  X
} from "lucide-react";
import type { CommitteeRunResult } from "@/lib/agents/orchestrator";
import { generateCommitteeReportPDF } from "@/lib/pdf/generateReport";
import { CommitteeVotePanel } from "@/components/committee/CommitteeVotePanel";
import { RiskPanel } from "@/components/committee/RiskPanel";
import { FinancialMetricsPanel } from "@/components/committee/FinancialMetricsPanel";
import { Logo } from "@/components/ui/Logo";
import { Background } from "@/components/ui/Background";
import { LiveProgress } from "@/components/committee/LiveProgress";
import { DecisionBanner } from "@/components/committee/DecisionBanner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "resolving" | "analyzing" | "done" | "error";
  resolvedTicker?: string;
  resolvedName?: string;
  analysisData?: CommitteeRunResult;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

const SUGGESTED_PROMPTS = [
  "Should I invest in Microsoft?",
  "Analyze Nvidia",
  "Compare Amazon and Google",
  "Is Tesla overvalued?",
  "Analyze Apple stock"
];

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryInput, setQueryInput] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Initial hydration and localStorage load
  useEffect(() => {
    setIsMounted(true);
    const savedSessions = localStorage.getItem("ai_investment_committee_sessions");
    const savedActiveId = localStorage.getItem("ai_investment_committee_active_session_id");
    const savedShowChat = localStorage.getItem("ai_investment_committee_show_chat");
    
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    if (savedActiveId) {
      setActiveSessionId(savedActiveId);
    }
    if (savedShowChat === "true") {
      setShowChat(true);
    }
  }, []);

  // 2. Persist state on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("ai_investment_committee_sessions", JSON.stringify(sessions));
    }
  }, [sessions, isMounted]);

  useEffect(() => {
    if (isMounted && activeSessionId) {
      localStorage.setItem("ai_investment_committee_active_session_id", activeSessionId);
    }
  }, [activeSessionId, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("ai_investment_committee_show_chat", showChat ? "true" : "false");
    }
  }, [showChat, isMounted]);

  // 3. Scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId, isLoading, activeStage]);

  // Welcome Screen actions
  const startAnalysis = () => {
    setShowChat(true);
    if (sessions.length === 0) {
      createNewChat();
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  };

  // Session management actions
  const createNewChat = () => {
    const newSessionId = "session_" + Date.now();
    const defaultSession: ChatSession = {
      id: newSessionId,
      title: "New Research Session",
      messages: [
        {
          id: "welcome_msg",
          role: "assistant",
          content: "Welcome to AI Investment Committee.\n\nI can help you analyze public companies, evaluate investment opportunities, compare stocks, assess risks, and summarize market sentiment.\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
          status: "done"
        }
      ],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [defaultSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  // Submit search query
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let currentSessionId = activeSessionId;
    
    // If no active session, create one first
    if (!currentSessionId) {
      currentSessionId = "session_" + Date.now();
      const newSession: ChatSession = {
        id: currentSessionId,
        title: text.length > 30 ? text.substring(0, 30) + "..." : text,
        messages: [
          {
            id: "welcome_msg",
            role: "assistant",
            content: "Welcome to AI Investment Committee.\n\nI can help you analyze public companies, evaluate investment opportunities, compare stocks, assess risks, and summarize market sentiment.\n\nHow can I help you today?",
            timestamp: new Date().toISOString(),
            status: "done"
          }
        ],
        createdAt: new Date().toISOString()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(currentSessionId);
    }

    const userMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    const assistantMsgId = "msg_assistant_" + Date.now();
    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      status: "resolving"
    };

    // Update the message feed
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const title = s.title === "New Research Session" 
          ? (text.length > 30 ? text.substring(0, 30) + "..." : text)
          : s.title;
        return {
          ...s,
          title,
          messages: [...s.messages, userMessage, assistantMessage]
        };
      }
      return s;
    }));

    setQueryInput("");
    setIsLoading(true);
    setError(null);
    setActiveStage(1);

    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    try {
      // 1. Resolve company name/prompt to ticker
      const resolveRes = await fetch("/api/resolve-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text.trim() }),
      });

      if (!resolveRes.ok) {
        const errData = await resolveRes.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || "Could not resolve company name. Please verify the spelling or try inputting a direct ticker symbol.");
      }

      const { ticker, name } = await resolveRes.json();

      // Update message status to analyzing with resolved details
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  status: "analyzing",
                  resolvedTicker: ticker,
                  resolvedName: name
                };
              }
              return m;
            })
          };
        }
        return s;
      }));

      // Stage timers simulation
      t1 = setTimeout(() => setActiveStage(2), 4000);
      t2 = setTimeout(() => setActiveStage(3), 9000);
      t3 = setTimeout(() => setActiveStage(4), 14000);

      // 2. Convene LangGraph Committee Analysis
      const committeeRes = await fetch("/api/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });

      const committeeData = await committeeRes.json();

      if (!committeeRes.ok) {
        throw new Error(committeeData.details ?? committeeData.error ?? "Failed to complete investment committee analysis.");
      }

      // Success: render decision and details
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  status: "done",
                  content: `Portfolio Manager Recommendation: ${committeeData.decision.finalDecision}\n\n${committeeData.decision.rationale}\n\nConfidence: ${committeeData.decision.confidenceScore}%`,
                  analysisData: committeeData
                };
              }
              return m;
            })
          };
        }
        return s;
      }));

    } catch (err) {
      const errMessage = (err as Error).message;
      setError(errMessage);
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  status: "error",
                  content: errMessage
                };
              }
              return m;
            })
          };
        }
        return s;
      }));
    } finally {
      clearTimeout(t1!);
      clearTimeout(t2!);
      clearTimeout(t3!);
      setActiveStage(0);
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05070c] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  // Welcome Screen view
  if (!showChat) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center overflow-hidden">
        <Background />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl w-full glass-panel p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full filter blur-xl" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[var(--color-bull)]/10 rounded-full filter blur-xl" />

          <div className="flex flex-col items-center">
            <Logo className="w-24 h-24 mb-8" />
            
            <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-2">
              Institutional Research Suite
            </p>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              AI Investment Committee
            </h1>
            
            <h2 className="text-sm md:text-base text-[var(--color-accent)] font-medium mb-6">
              Multi-Agent Investment Research Powered by AI
            </h2>
            
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-8">
              A consensus-driven network of specialized AI analysts evaluates public companies. By researching business models, auditing financial metrics, analyzing market sentiment, debating arguments, and calculating risk, the committee delivers objective, institutional-grade investment reports.
            </p>
            
            <button
              onClick={startAnalysis}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(45,212,255,0.4)] flex items-center justify-center gap-2 cursor-pointer text-slate-950 font-bold bg-[var(--color-accent)]"
            >
              Start Analysis
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#05070c] text-slate-100 overflow-hidden relative font-sans">
      <Background />

      {/* Left Sidebar */}
      <motion.div
        animate={{ width: isSidebarCollapsed ? 0 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex flex-col h-full bg-[#080b11]/90 backdrop-blur-xl border-r border-white/5 overflow-hidden shrink-0 z-30"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <button 
            onClick={() => setShowChat(false)}
            className="flex items-center gap-2.5 text-left group"
          >
            <Logo className="w-7 h-7" />
            <div>
              <h2 className="text-xs font-bold text-white tracking-wider uppercase">INV Committee</h2>
              <p className="text-[9px] text-slate-400 group-hover:text-[var(--color-accent)] transition-colors">Back to welcome</p>
            </div>
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Research Session
          </button>
        </div>

        {/* Session Search */}
        <div className="px-3 pb-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-6 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs outline-none focus:border-white/15 text-slate-200"
          />
        </div>

        {/* Previous Analysis Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 py-1 mt-2">
            History
          </p>
          {filteredSessions.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic px-2">No sessions found</p>
          ) : (
            filteredSessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full group flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-white/10 text-white font-medium border-l-2 border-[var(--color-accent)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-slate-300" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-500 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#06080d]/40 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors mr-1"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">
                {activeSession?.title || "Investment Analysis"}
              </h1>
              <p className="text-[10px] text-slate-400">Multi-Agent Investment Committee</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* If analysis is available in active chat, allow PDF Export in Header */}
            {activeSession?.messages.some(m => m.status === "done" && m.analysisData) && (
              <button
                onClick={() => {
                  const doneMsg = [...activeSession.messages].reverse().find(m => m.status === "done" && m.analysisData);
                  if (doneMsg?.analysisData) {
                    generateCommitteeReportPDF(doneMsg.analysisData);
                  }
                }}
                className="glass-panel glass-panel-hover px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-white hover:text-[var(--color-accent)] transition-colors border border-white/5 bg-white/5"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
            )}
          </div>
        </header>

        {/* Message Thread Scroll View */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
              <Logo className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-xs">Select or start a new research session</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((m, index) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col py-8 border-b border-white/5 transition-colors ${
                      isUser ? "bg-transparent" : "bg-[#090c13]/30"
                    }`}
                  >
                    <div className="max-w-4xl mx-auto w-full px-6 flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                          isUser
                            ? "border-white/10 bg-white/5 text-slate-300 text-xs font-semibold"
                            : "border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 text-[var(--color-accent)]"
                        }`}
                      >
                        {isUser ? "U" : <Logo className="w-5 h-5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-hidden">
                        {isUser ? (
                          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed pt-1.5">
                            {m.content}
                          </p>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {/* Message Greeting Text */}
                            {m.id === "welcome_msg" && (
                              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line pt-1">
                                {m.content}
                              </p>
                            )}

                            {/* Resolving Loader */}
                            {m.status === "resolving" && (
                              <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-accent)]" />
                                <span>Identifying entity and searching ticker...</span>
                              </div>
                            )}

                            {/* Analyzing Progress */}
                            {m.status === "analyzing" && (
                              <div className="flex flex-col gap-4 pt-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                                  <span>
                                    Resolved to <strong className="text-white">{m.resolvedName} ({m.resolvedTicker})</strong>. Convening committee...
                                  </span>
                                </div>
                                <LiveProgress activeStage={activeStage} />
                              </div>
                            )}

                            {/* Error case */}
                            {m.status === "error" && (
                              <div className="border border-[var(--color-bear)]/20 bg-[var(--color-bear)]/5 p-4 rounded-xl text-xs text-[var(--color-bear)] leading-relaxed">
                                {m.content}
                              </div>
                            )}

                            {/* Final Output Done */}
                            {m.status === "done" && m.analysisData && (
                              <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col gap-6"
                              >
                                {/* Conversational Summary / Decision Banner */}
                                <DecisionBanner decision={m.analysisData.decision} />

                                {/* Embedded Visual Panels */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  <CommitteeVotePanel
                                    reports={[
                                      m.analysisData.research,
                                      m.analysisData.financial,
                                      m.analysisData.news,
                                      m.analysisData.bear,
                                      m.analysisData.bull,
                                      m.analysisData.risk,
                                    ]}
                                    voteTally={m.analysisData.decision.voteTally}
                                  />
                                  <RiskPanel risk={m.analysisData.risk} />
                                  <FinancialMetricsPanel financial={m.analysisData.financial} />
                                </div>

                                {/* Detailed Accordion Analyst Cards */}
                                <ExpandableAnalystSection result={m.analysisData} />

                                {/* Action Buttons at bottom of result */}
                                <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-4">
                                  <p className="text-[10px] text-slate-500 font-mono-data">
                                    Report Timestamp: {new Date(m.analysisData.decision.generatedAt).toLocaleString()}
                                  </p>
                                  <button
                                    onClick={() => generateCommitteeReportPDF(m.analysisData!)}
                                    className="glass-panel glass-panel-hover px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors border border-white/5 bg-white/5"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Full Report PDF
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Suggestion Prompts Section (Shown only if thread only has the welcome message) */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto w-full px-6 mb-4 shrink-0">
            {SUGGESTED_PROMPTS.map((promptText) => (
              <button
                key={promptText}
                disabled={isLoading}
                onClick={() => handleSendMessage(promptText)}
                className="glass-panel glass-panel-hover p-4 text-left text-xs text-slate-300 hover:text-white transition-all font-medium flex items-center justify-between group cursor-pointer disabled:opacity-50 border border-white/5"
              >
                <span>{promptText}</span>
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}

        {/* Bottom Chat Input Composer */}
        <div className="p-6 max-w-4xl mx-auto w-full shrink-0 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(queryInput);
            }}
            className="glass-panel relative flex items-center overflow-hidden border border-white/10 bg-[#0c1017]/70 backdrop-blur-md shadow-2xl focus-within:border-white/20 transition-all rounded-2xl"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={isLoading ? "Deliberations in progress..." : "Ask the committee (e.g. 'Analyze Nvidia', 'Should I invest in Microsoft?')..."}
              disabled={isLoading}
              className="flex-1 bg-transparent px-5 py-4 text-sm text-white outline-none placeholder-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !queryInput.trim()}
              className="absolute right-4 p-2 rounded-xl text-slate-950 font-bold bg-[var(--color-accent)] hover:opacity-90 disabled:bg-slate-800 disabled:text-slate-500 transition-all cursor-pointer flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-600 mt-2">
            The AI Investment Committee represents consensus among automated specialist agents. Verify all information independently.
          </p>
        </div>
      </div>
    </div>
  );
}

// Expandable Analyst Cards Section
function ExpandableAnalystSection({ result }: { result: CommitteeRunResult }) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const analysts = [
    { name: "Research Analyst", report: result.research, icon: "🔍", color: "var(--color-accent)" },
    { name: "Financial Analyst", report: result.financial, icon: "📊", color: "var(--color-accent)" },
    { name: "News Analyst", report: result.news, icon: "📰", color: "var(--color-accent)" },
    { name: "Bull Analyst", report: result.bull, icon: "🐂", color: "var(--color-bull)" },
    { name: "Bear Analyst", report: result.bear, icon: "🐻", color: "var(--color-bear)" },
    { name: "Risk Officer", report: result.risk, icon: "🛡️", color: "var(--color-warning)" },
  ];

  return (
    <div className="flex flex-col gap-3 mt-4 border-t border-white/5 pt-5">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
        Detailed Analyst Reports
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysts.map((a) => {
          const isExpanded = expandedAgent === a.name;
          const r = a.report;
          
          return (
            <div 
              key={a.name}
              className="glass-panel transition-all duration-300 overflow-hidden border border-white/5 flex flex-col bg-white/2"
              style={{
                borderColor: isExpanded ? `${a.color}44` : "rgba(148, 163, 184, 0.08)",
                boxShadow: isExpanded ? `0 4px 20px ${a.color}11` : "none"
              }}
            >
              {/* Header Button */}
              <button
                onClick={() => setExpandedAgent(isExpanded ? null : a.name)}
                className="flex items-center justify-between p-4 w-full text-left font-semibold text-sm transition-colors hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-base shrink-0">{a.icon}</span>
                  <span className="truncate text-white" style={{ maxWidth: "120px" }}>{a.name}</span>
                  <span 
                    className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: r.stance === "bullish" ? "rgba(0, 214, 143, 0.1)" : r.stance === "bearish" ? "rgba(255, 77, 106, 0.1)" : "rgba(45, 212, 255, 0.1)",
                      color: r.stance === "bullish" ? "var(--color-bull)" : r.stance === "bearish" ? "var(--color-bear)" : "var(--color-accent)"
                    }}
                  >
                    {r.stance}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] font-mono-data text-slate-400">{r.confidence}% conf</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Body Details */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 pb-4 text-xs flex flex-col gap-3 border-t border-white/5 pt-3 bg-white/[0.01]"
                  >
                    <p className="leading-relaxed text-slate-200 font-medium">
                      {r.summary}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {r.keyPoints.map((point, idx) => (
                        <li key={idx} className="leading-relaxed text-slate-400 flex gap-2">
                          <span className="shrink-0" style={{ color: a.color }}>―</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    {a.name === "Risk Officer" && r.metrics && (
                      <div className="flex gap-4 mt-2 p-2 rounded-lg bg-white/5 border border-white/5 w-fit">
                        <div>
                          <span className="text-slate-500 mr-2">Risk Score:</span>
                          <span className="font-mono-data font-semibold text-[var(--color-warning)]">{r.metrics.riskScore}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 mr-2">Risk Level:</span>
                          <span className="font-mono-data font-semibold text-[var(--color-warning)]">{r.metrics.riskLevel}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}