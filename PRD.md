# Product Requirements Document: Pulse Research AI

## 1. Product Summary
**Product Name:** Pulse Research AI  
**Product Type:** AI-powered equity research copilot  
**Positioning:** A local-first financial intelligence platform powered by Gemma, Ollama, and a high-performance RAG pipeline.

**One-line pitch:** “Upload any annual report. Get analyst-grade insights in seconds—without sending your data to the cloud.”

---

## 2. Problem Statement
Analysts and investors face significant bottlenecks:
- Reading 200–500 page reports is time-consuming.
- Manual extraction of financial ratios is prone to error.
- Tracking management commentary across years is difficult.
- Existing cloud platforms are expensive and raise data privacy concerns.

---

## 3. Product Goals
- **Primary:** Turn raw financial documents into actionable investment intelligence.
- **Secondary:** 
  - Zero API cost using local models.
  - Private inference for sensitive data.
  - Fast local analysis using RAG.

---

## 4. Target Users
- **Primary:** Retail investors, finance students, research interns, independent analysts.
- **Secondary:** Small advisory firms, family offices.

---

## 5. Core Features

### Feature A — Document Upload & Processing
- **Inputs:** PDF (Annual reports, quarterly filings).
- **Extraction:** PyPDF-based text extraction.
- **Validation:** File size limits and format checks.

### Feature B — Local Gemma Intelligence
- **LLM:** Gemma (via Ollama).
- **RAG Pipeline:** Chunking (Recursive), Vector DB (ChromaDB), Embeddings (all-MiniLM-L6-v2).
- **Persona:** Senior Equity Analyst.

### Feature C — Financial Metrics Engine
- Automatic extraction and calculation of:
  - ROE, ROCE, EBITDA Margin, Net Margin, Debt/Equity, FCF Yield.
- JSON-based extraction for structured data visualization.

### Feature D — Analyst Chat
- Interactive Q&A backed by document context.
- Summarization of business risks, strengths, and management guidance.

---

## 6. Technical Stack
- **Frontend:** Next.js (App Router), Vanilla CSS (Modern Design System), Framer Motion, Lucide Icons.
- **Backend:** FastAPI (Python), LangChain, ChromaDB.
- **AI Core:** Ollama (Local Gemma 2/4).

---

## 7. Success Metrics
- **Performance:** PDF processing under 60 seconds.
- **Accuracy:** Retrieval accuracy > 85%.
- **UX:** Zero latency for local UI interactions.
