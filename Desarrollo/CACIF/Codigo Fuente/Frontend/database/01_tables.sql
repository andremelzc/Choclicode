-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Enums
CREATE TYPE intent_type AS ENUM ('CU01', 'CU02', 'CU03', 'CU04');
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE document_type AS ENUM ('reglamento', 'resolucion', 'directiva');

-- 1. Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university_code VARCHAR(12) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 2. Conversations Table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    intent_type intent_type NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0 NOT NULL
);

-- 3. Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER,
    rag_confidence FLOAT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Normative Documents Table
CREATE TABLE public.normative_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    type document_type NOT NULL,
    official_code VARCHAR(100),
    source_url VARCHAR(500),
    published_at DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Normative Chunks Table
CREATE TABLE public.normative_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.normative_documents(id) ON DELETE CASCADE,
    source_document VARCHAR(300) NOT NULL,
    start_page INTEGER,
    end_page INTEGER,
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    version VARCHAR(20) NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Cited Sources Table
CREATE TABLE public.cited_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES public.normative_chunks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    similarity_score FLOAT NOT NULL
);
