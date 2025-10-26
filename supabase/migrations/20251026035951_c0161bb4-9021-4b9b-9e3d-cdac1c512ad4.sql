-- Create exam sessions table
CREATE TABLE public.exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_title TEXT NOT NULL DEFAULT 'Practice Exam',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_remaining INTEGER NOT NULL DEFAULT 3600,
  current_question INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam answers table
CREATE TABLE public.exam_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  answer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_number)
);

-- Enable RLS
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_sessions
CREATE POLICY "Users can view their own exam sessions"
ON public.exam_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam sessions"
ON public.exam_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sessions"
ON public.exam_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for exam_answers
CREATE POLICY "Users can view their own exam answers"
ON public.exam_answers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.exam_sessions
    WHERE exam_sessions.id = exam_answers.session_id
    AND exam_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own exam answers"
ON public.exam_answers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exam_sessions
    WHERE exam_sessions.id = exam_answers.session_id
    AND exam_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own exam answers"
ON public.exam_answers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.exam_sessions
    WHERE exam_sessions.id = exam_answers.session_id
    AND exam_sessions.user_id = auth.uid()
  )
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_exam_sessions_updated_at
BEFORE UPDATE ON public.exam_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_answers_updated_at
BEFORE UPDATE ON public.exam_answers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();