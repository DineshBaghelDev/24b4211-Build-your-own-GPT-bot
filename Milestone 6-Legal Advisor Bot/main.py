from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langgraph.graph import START, StateGraph
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
import faiss
from langchain_huggingface import HuggingFaceEmbeddings
from typing_extensions import List, TypedDict
import re
from PyPDF2 import PdfReader
from flask import Flask, request, jsonify

# Preprocessing functions
def clean_text(text):
    """Remove headers, footers and normalize text"""
    lines = [line.strip() for line in text.split('\n')]
    clean_lines = []
    
    for line in lines:
        # Skip empty lines, page numbers, and metadata
        if (not line or len(line) < 10 or 
            re.match(r'^Page\s+\d+|^\d+$', line, re.IGNORECASE) or
            'ReportLab' in line or 'PDF' in line):
            continue
        clean_lines.append(line)
    
    return ' '.join(clean_lines)

def chunk_by_sections(text):
    """Split text by legal sections"""
    sections = re.split(r'(?=Chapter|Section|Article|Act|Rule)', text, flags=re.IGNORECASE)
    chunks = []
    
    for section in sections:
        if len(section) < 100:
            continue
        
        # Split long sections into smaller chunks
        words = section.split()
        for i in range(0, len(words), 250):
            chunk = ' '.join(words[i:i + 250])
            if len(chunk) > 50:
                chunks.append(chunk)
    
    return chunks

# Load PDF and setup
reader = PdfReader("indian_laws_comprehensive.pdf")
pdf_text = " ".join(page.extract_text() for page in reader.pages)
clean_text_data = clean_text(pdf_text)

llm = init_chat_model("deepseek-llm-7b-chat", model_provider="openai", 
                     base_url="http://127.0.0.1:1234/v1", api_key="lm-studio")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2", 
                                  model_kwargs={'device': 'cpu'})

# Create vector store
index = faiss.IndexFlatL2(len(embeddings.embed_query("test")))
vector_store = FAISS(embedding_function=embeddings, index=index, 
                    docstore=InMemoryDocstore(), index_to_docstore_id={})

# Process and index documents
chunks = chunk_by_sections(clean_text_data)
vector_store.add_texts(texts=chunks)

# Prompt template
prompt = PromptTemplate.from_template("""
Answer the question using the legal document information below.
If you can't find relevant information, say "I don't know - no relevant information found."
Be specific and refer to Indian legal documents when appropriate.
Always recommend consulting a lawyer for specific legal advice.

Document: {context}
Question: {question}
""")

# State and functions
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

def retrieve(state):
    docs = vector_store.similarity_search(state["question"], k=3)
    return {"context": docs}

def generate(state):
    if not state.get("context"):
        return {"answer": "I don't know - no relevant information found in the legal documents."}
    
    context = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": context})
    response = llm.invoke(messages)
    return {"answer": response.content}

# Build RAG pipeline
graph = StateGraph(State).add_sequence([retrieve, generate])
graph.add_edge(START, "retrieve")
rag_system = graph.compile()

# Flask API
app = Flask(__name__)

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query required'}), 400
        
        # Get answer from RAG system
        response = rag_system.invoke({"question": query})
        answer = response.get("answer", "")
        
        # Check if no relevant info found
        if "I don't know" in answer or "no relevant information" in answer:
            return jsonify({
                'query': query,
                'answer': answer,
                'context': None,
                'similar_documents': []
            })
        
        # Return successful response
        context_docs = response.get("context", [])
        similar_docs = [{'content': doc.page_content[:300] + "..."} 
                       for doc in context_docs]
        
        return jsonify({
            'query': query,
            'answer': answer,
            'context': answer,
            'similar_documents': similar_docs
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    test = rag_system.invoke({"question": "What are fundamental rights?"})
    print(f"Test result: {test['answer'][:50]}...")
    app.run(host='0.0.0.0', port=5000, debug=False)
