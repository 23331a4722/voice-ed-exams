import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: 'text' | 'multiple-choice';
}

interface Exam {
  id: string;
  title: string;
  duration: number;
}

export const useExamWithQuestions = (examId: string | undefined) => {
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExamAndQuestions = async () => {
      if (!examId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('*')
          .eq('id', examId)
          .eq('is_active', true)
          .single();

        if (examError) throw examError;
        if (!examData) {
          toast.error('Exam not found');
          setIsLoading(false);
          return;
        }

        setExam(examData);

        // Fetch questions for this exam
        const { data: questionsData, error: questionsError } = await supabase
          .from('exam_questions')
          .select('*')
          .eq('exam_id', examId)
          .order('question_number', { ascending: true });

        if (questionsError) throw questionsError;

        // Transform questions to match the expected format
        const transformedQuestions: Question[] = (questionsData || []).map((q, index) => ({
          id: index + 1,
          question: q.question_text,
          options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined,
          type: q.question_type as 'text' | 'multiple-choice'
        }));

        setQuestions(transformedQuestions);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching exam:', error);
        }
        toast.error('Failed to load exam');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamAndQuestions();
  }, [examId, user]);

  return {
    exam,
    questions,
    isLoading
  };
};
