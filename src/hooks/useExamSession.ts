import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

interface ExamSession {
  id: string;
  current_question: number;
  time_remaining: number;
  status: string;
}

const answerSchema = z.object({
  questionNumber: z.number().int().min(0).max(100),
  answerText: z.string().max(5000, 'Answer exceeds maximum length of 5000 characters')
});

export const useExamSession = (totalQuestions: number) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [answers, setAnswers] = useState<string[]>(new Array(totalQuestions).fill(''));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or resume session
  useEffect(() => {
    const initSession = async () => {
      if (!user) return;

      try {
        // Check for existing in-progress session
        const { data: existingSessions, error: fetchError } = await supabase
          .from('exam_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (existingSessions && existingSessions.length > 0) {
          // Resume existing session
          const session = existingSessions[0] as ExamSession;
          setSessionId(session.id);
          setCurrentQuestion(session.current_question);
          setTimeLeft(session.time_remaining);

          // Load answers
          const { data: savedAnswers, error: answersError } = await supabase
            .from('exam_answers')
            .select('*')
            .eq('session_id', session.id);

          if (answersError) throw answersError;

          if (savedAnswers) {
            const loadedAnswers = new Array(totalQuestions).fill('');
            savedAnswers.forEach((answer: any) => {
              loadedAnswers[answer.question_number] = answer.answer_text || '';
            });
            setAnswers(loadedAnswers);
          }

          toast.success('Resumed previous session');
        } else {
          // Create new session
          const { data: newSession, error: createError } = await supabase
            .from('exam_sessions')
            .insert({
              user_id: user.id,
              exam_title: 'Practice Exam',
              time_remaining: 3600,
              current_question: 0,
              status: 'in_progress'
            })
            .select()
            .single();

          if (createError) throw createError;

          setSessionId(newSession.id);
          toast.success('New exam session started');
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error initializing session:', error);
        }
        toast.error('Failed to initialize exam session');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [user, totalQuestions]);

  // Save answer to database
  const saveAnswer = useCallback(async (questionNumber: number, answerText: string) => {
    if (!sessionId) return;

    try {
      // Validate inputs
      const validated = answerSchema.parse({ questionNumber, answerText });

      const { error } = await supabase
        .from('exam_answers')
        .upsert({
          session_id: sessionId,
          question_number: validated.questionNumber,
          answer_text: validated.answerText
        }, {
          onConflict: 'session_id,question_number'
        });

      if (error) throw error;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to save answer');
      }
    }
  }, [sessionId]);

  // Update session progress
  const updateSession = useCallback(async (updates: Partial<ExamSession>) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('exam_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating session:', error);
      }
    }
  }, [sessionId]);

  // Update answer and save
  const updateAnswer = useCallback((questionNumber: number, answerText: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionNumber] = answerText;
      return newAnswers;
    });
    saveAnswer(questionNumber, answerText);
  }, [saveAnswer]);

  // Update current question and save to DB
  const updateCurrentQuestion = useCallback((questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    updateSession({ current_question: questionNumber });
  }, [updateSession]);

  // Update time and save periodically
  const updateTime = useCallback((newTime: number) => {
    setTimeLeft(newTime);
    // Save every 10 seconds to avoid too many DB calls
    if (newTime % 10 === 0) {
      updateSession({ time_remaining: newTime });
    }
  }, [updateSession]);

  // Complete session
  const completeSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('exam_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_remaining: timeLeft
        })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Exam submitted successfully!');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error completing session:', error);
      }
      toast.error('Failed to submit exam');
    }
  }, [sessionId, timeLeft]);

  return {
    sessionId,
    currentQuestion,
    timeLeft,
    answers,
    isLoading,
    updateAnswer,
    updateCurrentQuestion,
    updateTime,
    completeSession
  };
};