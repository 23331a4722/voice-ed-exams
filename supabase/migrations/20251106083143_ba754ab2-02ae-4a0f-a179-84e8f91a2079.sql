-- Add DELETE policies for data control and cleanup

-- Allow users to delete their own exam sessions
CREATE POLICY "Users can delete their own exam sessions"
ON public.exam_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own exam answers
CREATE POLICY "Users can delete their own exam answers"
ON public.exam_answers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.exam_sessions
    WHERE exam_sessions.id = exam_answers.session_id
    AND exam_sessions.user_id = auth.uid()
  )
);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));