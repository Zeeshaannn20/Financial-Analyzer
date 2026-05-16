"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  MessageSquare, 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Send,
  Loader2,
  TrendingUp,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  Zap,
  ChevronRight,
  Plus,
  Bell,
  Search,
  MoreVertical,
  Activity,
  Box,
  Lock,
  ArrowUpRight,
  User,
  X,
  Database,
  CloudLightning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE = "http://localhost:8000";

type ViewType = "dashboard" | "documents" | "intelligence" | "chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Metrics {
  ROE: string;
  ROCE: string;
  EBITDA_Margin: string;
  Net_Margin: string;
  Debt_Equity: string;
  FCF_Yield: string;
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [chat, setChat] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploading(true);
    setStatus("Extracting...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API_BASE}/upload`, formData);
      setStatus("Vectorizing...");
      fetchMetrics();
    } catch (err) {
      console.error(err);
      setStatus("Failed");
    } finally {
      setUploading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await axios.get(`${API_BASE}/metrics`);
      const parsedMetrics = typeof res.data.metrics === 'string' 
        ? JSON.parse(res.data.metrics) 
        : res.data.metrics;
      setMetrics(parsedMetrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loadingQuery) return;

    const userMsg = { role: "user" as const, content: query };
    setChat(prev => [...prev, userMsg]);
    setQuery("");
    setLoadingQuery(true);

    try {
      const res = await axios.post(`${API_BASE}/query`, { query: userMsg.content });
      setChat(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
      setChat(prev => [...prev, { role: "assistant", content: "Error communicating with local Gemma." }]);
    } finally {
      setLoadingQuery(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="bg-dots" />
      
      <div className="app-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh' }}>
        {/* Sidebar */}
        <aside className="sidebar" style={{ height: '100vh', overflowY: 'auto' }}>
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-tight text-white mb-0.5">Pulse Research</h1>
          <p className="heading-xs opacity-50">Local-First Intelligence</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<FileText size={18} />} label="Documents" active={activeView === 'documents'} onClick={() => setActiveView('documents')} />
          <NavItem icon={<Activity size={18} />} label="Intelligence" active={activeView === 'intelligence'} onClick={() => setActiveView('intelligence')} />
          <NavItem icon={<MessageSquare size={18} />} label="Analyst Chat" active={activeView === 'chat'} onClick={() => setActiveView('chat')} />
        </nav>

        <div className="mt-auto pt-6 space-y-6">
          <label className="btn-primary w-full cursor-pointer relative overflow-hidden">
            <Plus size={20} />
            <span>New Analysis</span>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload} 
              accept=".pdf" 
            />
          </label>
          
          <div className="space-y-1">
            <NavItem icon={<Settings size={18} />} label="Settings" />
            <NavItem icon={<Box size={18} />} label="System Status" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Zap size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Senior Analyst</p>
              <p className="text-[10px] text-slate-500 font-medium">Pulse Terminal V1</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ height: '100vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Bar */}
        <header className="h-[72px] px-8 flex items-center justify-between border-b border-white/5 bg-transparent backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold tracking-tight text-white capitalize">{activeView === 'documents' ? 'Document Intelligence' : activeView === 'chat' ? 'Analyst Chat' : activeView}</h2>
            {activeView === 'dashboard' && (
              <div className="flex items-center ml-4">
                <Search size={14} className="text-slate-500 mr-2" />
                <input placeholder="Search reports or intelligence..." className="bg-transparent border-none text-xs focus:outline-none w-64 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="status-pill status-active">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-soft-pulse" />
              Local Inference: Active
            </div>
            <Bell size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
            <User size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </header>

        {/* View Layouts */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'documents' && <DocumentsView file={file} uploading={uploading} status={status} handleFileUpload={handleFileUpload} />}
            {activeView === 'intelligence' && <IntelligenceView metrics={metrics} loading={loadingMetrics} />}
            {activeView === 'chat' && <ChatView chat={chat} loading={loadingQuery} handleQuery={handleQuery} query={query} setQuery={setQuery} chatEndRef={chatEndRef} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Local Model Status" value="Gemma 2 Ready" sub="Hardware Acceleration: CUDA/Metal" icon={<Cpu size={20} />} accent="text-blue-500" />
        <StatCard title="Library Size" value="24 Reports" sub="+4 processed this week" icon={<FileText size={20} />} accent="text-emerald-500" />
        <StatCard title="Recent Query" value="Summary of Debt/Equity" sub='"Found 12 mentions across 3 docs..."' icon={<Sparkles size={20} />} accent="text-amber-500" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="heading-xs flex items-center gap-2"><History size={14} /> Recently Processed</h3>
            <span className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4">
            <ReportRow name="Apple 2023 10-K" date="Annual Report • PDF" tags={["Service Growth +12%", "Vision Pro R&D"]} sentiment={0.84} />
            <ReportRow name="Nvidia Q3 Earnings" date="Quarterly Report • CSV" tags={["AI Data Center Lead", "Supply Chain Bottlenecks"]} sentiment={0.96} />
            <ReportRow name="Tesla Sustainability 2023" date="Annual Report • PDF" tags={["Lithium Refining Scope", "Regulatory Credits"]} sentiment={0.42} />
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="heading-xs flex items-center gap-2 mb-8"><TrendingUp size={14} /> Market Trend</h3>
          <div className="mb-6">
            <p className="heading-xs opacity-50 mb-1">S&P 500 Proxy</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">5,024.30</span>
              <span className="text-xs font-bold text-emerald-500">+1.24%</span>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-1.5 h-32 mb-4">
            {[40, 60, 45, 90, 70, 55, 80, 100, 65, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative overflow-hidden">
                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="absolute bottom-0 inset-x-0 bg-blue-500/20" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Market Open • 09:30 AM
            </p>
            <ArrowUpRight size={14} className="text-slate-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Documents View ---
function DocumentsView({ file, uploading, status, handleFileUpload }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card border-dashed border-white/10 hover:border-blue-500/30 transition-all p-12 flex flex-col items-center justify-center text-center cursor-pointer group">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Drag and drop institutional PDFs</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">Secure, local-only processing for financial reports, legal filings, and proprietary datasets. Files never leave your hardware.</p>
          <label className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer">
            Select Files from Workstation
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" />
          </label>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h4 className="heading-xs mb-4">Storage Metrics</h4>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-medium">Local Vector DB</span>
              <span className="font-mono text-slate-500">1.2 GB / 10 GB</span>
            </div>
            <div className="progress-container mb-4">
              <div className="progress-fill" style={{ width: '12%' }} />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
              <Lock size={12} /> End-to-End Encryption AES-256 Vault Active
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20">
            <h4 className="heading-xs text-blue-500 mb-4">Model Context</h4>
            <p className="text-lg font-bold mb-1">Gemma 7B Local</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Optimized for financial terminology and complex document cross-referencing.</p>
          </div>
        </div>
      </div>

      {(file || uploading) && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="heading-xs text-emerald-500 flex items-center gap-2"><CloudLightning size={14} /> Active Processing Queue</h4>
            <span className="text-[10px] text-emerald-500 font-mono">1 File Syncing</span>
          </div>
          <div className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-0.5">{file?.name || "Processing Document"}</p>
              <p className="text-[10px] text-slate-500">{(file?.size || 0) / 1024} KB • PDF</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Sparkles size={12} /></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Extracting Text</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Database size={12} /></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Vectorizing Content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500 animate-soft-pulse"><Cpu size={12} /></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Local Gemma Embedding... 58%</span>
              </div>
            </div>
            <X size={18} className="text-slate-500 hover:text-white cursor-pointer" />
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="heading-xs">Library History</h4>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
              <input placeholder="Filter documents..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs w-48 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="heading-xs border-b border-white/5">
              <th className="text-left pb-4">Document Name</th>
              <th className="text-left pb-4">Upload Date</th>
              <th className="text-left pb-4">Token Count</th>
              <th className="text-left pb-4">Status</th>
              <th className="text-right pb-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-400">
            <TableRow name="JP_Morgan_Q4_23_Call_Transcript.pdf" date="Oct 24, 2023" tokens="14,288" />
            <TableRow name="Federal_Reserve_Minutes_Dec_2023.pdf" date="Dec 15, 2023" tokens="8,540" />
            <TableRow name="Nvidia_H100_Technical_Spec_Sheet.pdf" date="Nov 02, 2023" tokens="3,122" />
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// --- Intelligence View ---
function IntelligenceView({ metrics, loading }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'grid', gridTemplateColumns: '240px 1fr 320px', gap: '24px' }}
    >
      {/* Left Column: View Context */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card p-6">
          <h4 className="heading-xs mb-4">View Context</h4>
          <div className="space-y-1">
            <ContextItem label="Consolidated Statement" active />
            <ContextItem label="Segment Analysis" />
            <ContextItem label="Geographic Revenue" />
          </div>
        </div>
        <div className="glass-card p-6">
          <h4 className="heading-xs mb-4">Market Context</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">Price</span>
            <span className="text-xs font-bold text-emerald-500 font-mono">$172.63</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-slate-500">Market Cap</span>
            <span className="text-xs font-bold font-mono">$549.4B</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="heading-xs mb-2 opacity-30">AI Summary</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">Tesla maintains strong margins despite sector headwinds. Net cash position remains robust.</p>
          </div>
        </div>
      </div>

      {/* Middle Column: Ratios & Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="grid grid-cols-3 gap-4">
          <MetricRatio label="ROE" value="24.1%" trend="+2.1%" />
          <MetricRatio label="ROCE" value="19.8%" trend="-0.5%" />
          <MetricRatio label="EBITDA" value="17.2%" trend="+1.4%" />
          <MetricRatio label="Net Margin" value="14.5%" trend="-3.0%" />
          <MetricRatio label="Debt/Equity" value="0.08x" trend="-12%" />
          <MetricRatio label="FCF Yield" value="2.85%" trend="+8.2%" />
        </div>

        <div className="glass-card p-8 flex-1">
          <h4 className="text-sm font-bold mb-1">Financial Ratio Breakdown</h4>
          <p className="heading-xs opacity-50 mb-8 font-medium">Annualized performance metrics comparison 2021 | 2022 | 2023</p>
          
          <div className="space-y-10">
            <RatioBar label="Gross Margin" values={[18.4, 21.0, 21.4]} unit="%" />
            <RatioBar label="Operating Margin" values={[10.2, 13.5, 13.8]} unit="%" />
            <RatioBar label="Asset Turnover" values={[0.74, 0.92, 0.94]} unit="x" />
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 italic">Source: 10-K Filings, Local Database v4.2</p>
            <span className="heading-xs cursor-pointer hover:text-white flex items-center gap-2">Export Data <ArrowUpRight size={12} /></span>
          </div>
        </div>
      </div>

      {/* Right Column: Core Intelligence */}
      <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-sm font-bold">Core Intelligence</h4>
          <span className="status-pill status-active">Ready</span>
        </div>
        <div className="space-y-8">
          <InsightBlock title="Efficiency Signal" text="ROE outperformed industry average by 450bps. Asset utilization remains in the top quartile." />
          <InsightBlock title="Liquidity Outlook" text="Current ratio of 1.7x suggests strong short-term solvency. No immediate refinancing risks detected." />
          <InsightBlock title="Peer Correlation" text="High correlation with BYD pricing cycles. Watching for potential margin compression in Q4." />
        </div>
      </div>
    </motion.div>
  );
}

// --- Chat View ---
function ChatView({ chat, loading, handleQuery, query, setQuery, chatEndRef }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: '24px', height: '100%' }}
    >
      {/* Left: Reference Docs */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="custom-scrollbar pr-2">
        <h4 className="heading-xs flex items-center gap-2"><FileText size={14} /> Reference Documents</h4>
        <RefDoc name="NVDA_FY24_Annual_Report.pdf" tag="SEC 10-K" text='"...increased geopolitical tensions may impact sales to data center customers in certain jurisdictions, specifically..."' />
        <RefDoc name="Nvidia_Q4_Earnings_Transcript.txt" tag="Earnings" text='"Supply chain agility remains paramount as demand for Hopper and Blackwell arch textures continues to outstrip..."' />
        <RefDoc name="Market_Analysis_NVIDIA_2024.pdf" tag="Risk Factors" text='"Market concentration in top-tier cloud service providers presents a recurring revenue risk should capital expenditure..."' />
      </div>

      {/* Center: Chat UI */}
      <div className="glass-card flex flex-col bg-[#06090f]/50 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between px-6">
          <h4 className="heading-xs">Analyst Chat</h4>
          <div className="flex items-center gap-3">
            <Search size={14} className="text-slate-600" />
            <User size={14} className="text-slate-600" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {chat.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 gap-4">
              <Cpu size={64} strokeWidth={1} className="text-blue-500" />
              <div>
                <p className="text-xl font-black italic">Waiting for analytical Input</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Gemma 7B Terminal V1</p>
              </div>
            </div>
          ) : (
            chat.map((m: any, i: any) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Zap size={12} /></div>
                    <span className="heading-xs text-emerald-500">Senior Equity Analyst AI</span>
                  </div>
                )}
                <div className={`p-5 rounded-2xl max-w-[90%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/5'}`}>
                  {m.content}
                  {m.role === 'assistant' && i === chat.length - 1 && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Database size={14} /></div>
                          <span className="heading-xs">Supply Chain Constraints</span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-400">
                          <li>• Wafer packaging capacity (CoWoS) at TSMC.</li>
                          <li>• HBM3e memory component availability.</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Zap size={14} /></div>
                          <span className="heading-xs">Geopolitical Risks</span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-400">
                          <li>• Expansion of US export controls (ECCN).</li>
                          <li>• Sovereign AI infrastructure delays.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex flex-col items-start gap-4 animate-pulse">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-20 w-full bg-white/5 rounded-2xl" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            <Suggested label="Summarize Q4 revenue by segment" />
            <Suggested label="Compare margins with AMD 2024" />
          </div>
          <form onSubmit={handleQuery} className="relative">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Analyze risk factors, supply chain, or margins..."
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white">
              <Send size={18} />
            </button>
          </form>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[14%]" />
                </div>
                <span className="text-[10px] text-slate-500 font-bold">Utilized: 14%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">Context Window: 128k</span>
            </div>
            <div className="heading-xs opacity-30 flex gap-4">
              <span>Llama-3-70B-PP1A</span>
              <span className="text-emerald-500">Local Inference Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Entity Insights */}
      <div className="glass-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h4 className="heading-xs">Entity Insights: NVIDIA</h4>
          <MoreVertical size={14} className="text-slate-600" />
        </div>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div>
            <p className="heading-xs mb-1 opacity-50">Market Cap</p>
            <p className="text-xl font-bold font-mono">$2.24T</p>
          </div>
          <div>
            <p className="heading-xs mb-1 opacity-50">P/E Ratio</p>
            <p className="text-xl font-bold font-mono">74.2x</p>
          </div>
        </div>
        <div className="space-y-8 flex-1">
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="heading-xs opacity-50">AI Pulse Monitor</p>
              <span className="text-[10px] text-emerald-500 font-bold">Real-time</span>
            </div>
            <div className="flex items-end gap-1 h-20">
              {[30, 50, 40, 80, 70, 95, 60, 85].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-emerald-500' : 'bg-emerald-500/20'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div>
            <p className="heading-xs mb-4 opacity-50">Key Risk Radar</p>
            <div className="space-y-4">
              <Radar label="Regulatory Compliance" value="High" color="bg-red-500" />
              <Radar label="Competitor Disruption" value="Moderate" color="bg-amber-500" />
              <Radar label="Execution Speed" value="Low" color="bg-emerald-500" />
            </div>
          </div>
          <button className="w-full py-3 bg-white/5 border border-white/5 rounded-xl heading-xs hover:bg-white/10 transition-all mt-auto">Generate Risk Map</button>
        </div>
      </div>
    </motion.div>
  );
}

// --- UI Components ---
function StatCard({ title, value, sub, icon, accent }: any) {
  return (
    <div className="glass-card p-6 group hover:bg-white/[0.02] transition-colors relative">
      <div className="flex justify-between items-start mb-8">
        <div className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center ${accent} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
      </div>
      <div>
        <h4 className="heading-xs opacity-50 mb-1">{title}</h4>
        <p className="text-xl font-bold italic text-white tracking-tight mb-1">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{sub}</p>
      </div>
    </div>
  );
}

function ReportRow({ name, date, tags, sentiment }: any) {
  return (
    <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group">
      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
        <FileText size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white mb-0.5">{name}</p>
        <p className="heading-xs opacity-50 text-[10px]">{date}</p>
      </div>
      <div className="flex gap-2">
        {tags.map((t: any, i: any) => (
          <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-bold text-slate-400">{t}</span>
        ))}
      </div>
      <div className="w-32 flex flex-col items-end gap-1.5">
        <div className="flex justify-between w-full text-[9px] font-black tracking-tighter uppercase opacity-50">
          <span>Analyst Sentiment</span>
          <span className="font-mono text-emerald-500">{sentiment.toFixed(2)}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${sentiment * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function TableRow({ name, date, tokens }: any) {
  return (
    <tr className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
      <td className="py-4 flex items-center gap-3">
        <FileText size={14} className="text-slate-600 group-hover:text-blue-500" />
        <span className="text-slate-200">{name}</span>
      </td>
      <td className="py-4 text-slate-500">{date}</td>
      <td className="py-4 font-mono text-slate-500">{tokens}</td>
      <td className="py-4">
        <span className="status-pill status-active w-fit">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Analyst Ready
        </span>
      </td>
      <td className="py-4 text-right">
        <div className="flex justify-end gap-4 text-slate-600">
          <MessageSquare size={16} className="cursor-pointer hover:text-white" />
          <MoreVertical size={16} className="cursor-pointer hover:text-white" />
        </div>
      </td>
    </tr>
  );
}

function ContextItem({ label, active = false }: any) {
  return (
    <div className={`p-3 rounded-lg text-xs font-medium cursor-pointer transition-all ${active ? 'bg-blue-600/10 border border-blue-500/30 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
      {label}
    </div>
  );
}

function MetricRatio({ label, value, trend }: any) {
  return (
    <div className="glass-card p-4 hover:bg-white/[0.03] transition-all">
      <p className="heading-xs opacity-50 mb-1">{label}</p>
      <div className="flex justify-between items-baseline mb-3">
        <p className="text-lg font-bold font-mono">{value}</p>
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{trend}</span>
      </div>
      <div className="flex items-end gap-1 h-6">
        {[20, 50, 40, 80, 60].map((h, i) => (
          <div key={i} className="flex-1 bg-emerald-500/10 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function RatioBar({ label, values, unit }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span>{values[2]}{unit} <span className="opacity-30">(avg)</span></span>
      </div>
      <div className="flex gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex-1 h-6 bg-white/5 rounded-sm relative overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(v / Math.max(...values)) * 100}%` }} className={`h-full ${i === 2 ? 'bg-blue-500/40' : 'bg-slate-700/20'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightBlock({ title, text }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
        <Sparkles size={12} /> {title}
      </p>
      <p className="text-xs leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function RefDoc({ name, tag, text, border = "border-white/10" }: any) {
  return (
    <div className={`p-4 bg-white/5 border ${border} rounded-xl space-y-3 hover:bg-white/[0.08] transition-all cursor-pointer group`}>
      <div className="flex justify-between items-start">
        <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded border border-white/5 text-slate-500">{tag}</span>
        <ArrowUpRight size={12} className="text-slate-700 group-hover:text-white" />
      </div>
      <p className="text-[11px] font-bold text-slate-200">{name}</p>
      <p className="text-[10px] text-slate-500 italic line-clamp-3 leading-relaxed">{text}</p>
    </div>
  );
}

function Radar({ label, value, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: value === 'High' ? '90%' : value === 'Moderate' ? '60%' : '30%' }} />
      </div>
    </div>
  );
}

function Suggested({ label }: any) {
  return (
    <div className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg heading-xs hover:bg-white/10 hover:text-white transition-all whitespace-nowrap cursor-pointer">
      Suggested: "{label}"
    </div>
  );
}
