import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const MoodContext = createContext();

const initialState = {
  currentMood: null,
  moodHistory: [],
  isLoading: false,
  error: null,
};

function moodReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_CURRENT_MOOD':
      return {
        ...state,
        currentMood: action.payload,
        error: null,
      };
    case 'SET_MOOD_HISTORY':
      return {
        ...state,
        moodHistory: action.payload,
        error: null,
      };
    case 'ADD_MOOD':
      return {
        ...state,
        moodHistory: [action.payload, ...state.moodHistory],
        currentMood: action.payload,
      };
    default:
      return state;
  }
}

export function MoodProvider({ children }) {
  const [state, dispatch] = useReducer(moodReducer, initialState);

  const fetchCurrentMood = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not authenticated - set no current mood
        dispatch({ type: 'SET_CURRENT_MOOD', payload: null });
        return;
      }

      const { data, error } = await supabase
        .from('user_moods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      dispatch({ type: 'SET_CURRENT_MOOD', payload: data });
    } catch (error) {
      console.error('Error fetching current mood:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchMoodHistory = useCallback(async (limit = 10) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not authenticated - set empty mood history
        dispatch({ type: 'SET_MOOD_HISTORY', payload: [] });
        return;
      }

      const { data, error } = await supabase
        .from('user_moods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      dispatch({ type: 'SET_MOOD_HISTORY', payload: data || [] });
    } catch (error) {
      console.error('Error fetching mood history:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const saveMood = useCallback(async (moodData, moodScore, moodDescription) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For backward compatibility, still save to localStorage even without auth
        localStorage.setItem('userMood', JSON.stringify(moodData));
        dispatch({ type: 'SET_ERROR', payload: 'Please sign in to save mood history' });
        return null;
      }

      const { data, error } = await supabase
        .from('user_moods')
        .insert([{
          user_id: user.id,
          mood_data: moodData,
          mood_score: moodScore,
          mood_description: moodDescription,
        }])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_MOOD', payload: data });
      
      // Also save to localStorage for backward compatibility
      localStorage.setItem('userMood', JSON.stringify(moodData));
      
      return data;
    } catch (error) {
      console.error('Error saving mood:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getMoodTrends = useCallback(async (days = 30) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('User not authenticated - returning empty mood trends');
        return [];
      }

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_moods')
        .select('mood_score, created_at')
        .eq('user_id', user.id)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching mood trends:', error);
      return [];
    }
  }, []);

  const clearMoodHistory = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Just clear localStorage if not authenticated
        localStorage.removeItem('userMood');
        dispatch({ type: 'SET_CURRENT_MOOD', payload: null });
        dispatch({ type: 'SET_MOOD_HISTORY', payload: [] });
        return true;
      }

      const { error } = await supabase
        .from('user_moods')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'SET_CURRENT_MOOD', payload: null });
      dispatch({ type: 'SET_MOOD_HISTORY', payload: [] });
      
      // Clear localStorage as well
      localStorage.removeItem('userMood');
      
      return true;
    } catch (error) {
      console.error('Error clearing mood history:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value = {
    ...state,
    fetchCurrentMood,
    fetchMoodHistory,
    saveMood,
    getMoodTrends,
    clearMoodHistory,
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
} 