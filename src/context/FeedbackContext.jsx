import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitFeedback = useCallback(async (feedbackData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          user_id: user?.id || null,
          email: feedbackData.email,
          feedback_type: feedbackData.type,
          message: feedbackData.message,
          rating: feedbackData.rating,
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.message);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserFeedback = useCallback(async (limit = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      setError(error.message);
      return { data: [], error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isLoading,
    error,
    submitFeedback,
    getUserFeedback,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
} 