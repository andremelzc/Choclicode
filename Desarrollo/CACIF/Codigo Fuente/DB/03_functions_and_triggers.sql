-- 1. Trigger to update 'total_messages' in the conversations table automatically
CREATE OR REPLACE FUNCTION public.update_total_messages()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.conversations
        SET total_messages = total_messages + 1
        WHERE id = NEW.conversation_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.conversations
        SET total_messages = total_messages - 1
        WHERE id = OLD.conversation_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_total_messages
AFTER INSERT OR DELETE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_total_messages();


-- 2. Trigger to automatically create a Student profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, email, full_name, university_code)
  VALUES (
    NEW.id,
    NEW.email,
    -- Aquí puedes extraer el nombre y código si los envías en los user_metadata al registrarte:
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Estudiante UNMSM'),
    COALESCE(NEW.raw_user_meta_data->>'university_code', 'POR_ASIGNAR')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
