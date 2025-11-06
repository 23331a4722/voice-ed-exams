-- Create exams table to store exam definitions
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration integer NOT NULL DEFAULT 3600, -- duration in seconds
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Create exam_questions table to store questions for each exam
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text', 'multiple-choice')),
  options jsonb, -- array of options for multiple choice questions
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(exam_id, question_number)
);

-- Enable RLS on exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Enable RLS on exam_questions table
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- Exams policies - all authenticated users can view active exams
CREATE POLICY "Anyone can view active exams"
ON public.exams
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins and teachers can create exams
CREATE POLICY "Admins and teachers can create exams"
ON public.exams
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Creators can update their own exams
CREATE POLICY "Creators can update their own exams"
ON public.exams
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Admins can delete any exam
CREATE POLICY "Admins can delete exams"
ON public.exams
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Exam questions policies - users can view questions for active exams
CREATE POLICY "Users can view questions for active exams"
ON public.exam_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams
    WHERE exams.id = exam_questions.exam_id
    AND exams.is_active = true
  )
);

-- Admins and teachers can insert questions
CREATE POLICY "Admins and teachers can insert questions"
ON public.exam_questions
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Admins and teachers can update questions
CREATE POLICY "Admins and teachers can update questions"
ON public.exam_questions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Admins can delete questions
CREATE POLICY "Admins can delete questions"
ON public.exam_questions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for exams
CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update exam_sessions to reference exams table
ALTER TABLE public.exam_sessions
ADD COLUMN exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE;

-- Insert sample exams for testing
INSERT INTO public.exams (title, description, duration, is_active) VALUES
('General Knowledge Quiz', 'Test your general knowledge across various topics', 1800, true),
('Science Fundamentals', 'Basic science concepts and principles', 2400, true),
('Mathematics Assessment', 'Mathematical problem solving and reasoning', 3600, true);

-- Insert sample questions for the first exam
INSERT INTO public.exam_questions (exam_id, question_number, question_text, question_type, options)
SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  1,
  'What is the capital of France?',
  'multiple-choice',
  '["A: London", "B: Paris", "C: Berlin", "D: Madrid"]'::jsonb;

INSERT INTO public.exam_questions (exam_id, question_number, question_text, question_type, options)
SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  2,
  'Which planet is known as the Red Planet?',
  'multiple-choice',
  '["A: Venus", "B: Mars", "C: Jupiter", "D: Saturn"]'::jsonb;

INSERT INTO public.exam_questions (exam_id, question_number, question_text, question_type, options)
SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  3,
  'What is the largest ocean on Earth?',
  'multiple-choice',
  '["A: Atlantic Ocean", "B: Indian Ocean", "C: Arctic Ocean", "D: Pacific Ocean"]'::jsonb;

INSERT INTO public.exam_questions (exam_id, question_number, question_text, question_type, options)
SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  4,
  'Explain the process of photosynthesis in plants.',
  'text',
  NULL;