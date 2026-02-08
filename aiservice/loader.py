import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def load_pdf(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    loader = PyPDFLoader(file_path)
    pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(pages)
    return chunks


# ==========================================WHAT================
# What this code does (very simple)

# Opens a PDF file

# Reads its content

# Splits it page by page

# Returns text in structured format

#============================================= Where this is used

# Load teacher notes (PDF)

# Send content to AI model

# Answer student questions from notes
# PDF Notes
#    ↓
# Page Text
#    ↓
# Text Chunks
#    ↓
# Embeddings
#    ↓
# FAISS Vector Store
