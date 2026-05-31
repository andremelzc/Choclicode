-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normative_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normative_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cited_sources ENABLE ROW LEVEL SECURITY;

-- Policies for Students
-- Students can only read their own profile. We assume Supabase Auth User ID matches `students.id`.
CREATE POLICY "Students can view their own profile"
    ON public.students FOR SELECT
    USING (auth.uid() = id);

-- Policies for Conversations
-- Students can view, insert and update their own conversations.
CREATE POLICY "Students can view their own conversations"
    ON public.conversations FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own conversations"
    ON public.conversations FOR UPDATE
    USING (student_id = auth.uid());

-- Policies for Messages
-- Students can view and insert messages related to their own conversations.
CREATE POLICY "Students can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id AND c.student_id = auth.uid()
    ));

CREATE POLICY "Students can insert messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id AND c.student_id = auth.uid()
    ));

-- Policies for Cited Sources
-- Students can view cited sources of messages in their conversations.
CREATE POLICY "Students can view cited sources of their messages"
    ON public.cited_sources FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.conversations c ON m.conversation_id = c.id
        WHERE m.id = cited_sources.message_id AND c.student_id = auth.uid()
    ));

-- Policies for Normative Documents and Chunks
-- These tables are typically read-only for users, managed by admin or system backend.
CREATE POLICY "Authenticated users can view normative documents"
    ON public.normative_documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view normative chunks"
    ON public.normative_chunks FOR SELECT
    TO authenticated
    USING (true);
