import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

app = FastAPI(title="Pulse Research AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_DIR = "uploads"
CHROMA_DIR = "chroma_db"
OLLAMA_HOST = "http://localhost:11434"
MODEL_NAME = "gemma4:e4b" # Found in local ollama list

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Ollama client
client = ollama.Client(host=OLLAMA_HOST)

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Global vector store reference
vector_store = None

class QueryRequest(BaseModel):
    query: str
    workspace_id: Optional[str] = "default"

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    global vector_store
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Load and split document
    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        # Create/Update vector store
        if vector_store is None:
            vector_store = Chroma.from_documents(
                documents=chunks,
                embedding=embeddings,
                persist_directory=CHROMA_DIR
            )
        else:
            vector_store.add_documents(chunks)
            
        return {"message": f"Successfully processed {file.filename}", "chunks": len(chunks)}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_analyst(request: QueryRequest):
    global vector_store
    if vector_store is None:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")
    
    # Retrieve relevant context
    results = vector_store.similarity_search(request.query, k=4)
    context = "\n\n".join([doc.page_content for doc in results])
    sources = [doc.metadata.get("source", "Unknown") for doc in results]
    
    prompt = f"""
    Role: Senior Equity Analyst
    Context: {context}
    
    Question: {request.query}
    
    Instructions:
    - Use ONLY the provided context to answer.
    - If the information is not in the context, say you don't know.
    - Provide a structured and professional answer.
    """
    
    try:
        response = client.chat(model=MODEL_NAME, messages=[
            {'role': 'user', 'content': prompt}
        ])
        return QueryResponse(answer=response['message']['content'], sources=list(set(sources)))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_financial_metrics():
    global vector_store
    if vector_store is None:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")
    
    # Specific prompt for metrics extraction
    metrics_query = "Extract key financial metrics: ROE, ROCE, EBITDA Margin, Net Margin, Debt/Equity, FCF Yield."
    results = vector_store.similarity_search(metrics_query, k=6) 
    context = "\n\n".join([doc.page_content for doc in results])
    
    prompt = f"""
    Role: Senior Equity Analyst
    Context: {context}
    
    Task: Extract the following financial metrics for the most recent fiscal year:
    1. ROE (Return on Equity)
    2. ROCE (Return on Capital Employed)
    3. EBITDA Margin
    4. Net Margin
    5. Debt/Equity Ratio
    6. FCF Yield (Free Cash Flow Yield)
    
    Return the result in JSON format only. If a metric is not found, use "N/A".
    Example:
    {{
        "ROE": "15%",
        "ROCE": "18%",
        "EBITDA_Margin": "25%",
        "Net_Margin": "10%",
        "Debt_Equity": "0.5",
        "FCF_Yield": "4%"
    }}
    """
    
    try:
        response = client.chat(model=MODEL_NAME, messages=[
            {'role': 'user', 'content': prompt}
        ])
        content = response['message']['content'].strip()
        # Basic JSON extraction
        if "{" in content and "}" in content:
            content = content[content.find("{"):content.rfind("}")+1]
            
        return {"metrics": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
