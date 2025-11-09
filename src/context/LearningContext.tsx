// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// This file centralizes all application state management using React's
// Context and Reducer hooks. It handles state persistence to localStorage
// and provides the state and dispatch function to the entire app.

import React, { createContext, useContext, useReducer, useEffect, useState, FC, ReactNode } from 'react';
import { AppState, AppAction } from '../types';
import { INITIAL_LEARNING_ITEMS } from '../constants';

// ============================================================================
// == SECTION 1: STATE & REDUCER
// ============================================================================

const initialState: AppState = {
  learningItems: INITIAL_LEARNING_ITEMS,
  parentPassword: null,
  isLocked: false,
  isPasswordVerified: false,
  complexityLevel: 1,
  speechRate: 0.8,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'SET_PASSWORD':
      return { ...state, parentPassword: action.payload, isPasswordVerified: true, isLocked: false };
    case 'UNLOCK':
      return { ...state, isPasswordVerified: true, isLocked: false };
    case 'LOCK':
      return { ...state, isPasswordVerified: false, isLocked: true };
    case 'EXIT_TO_GAME':
      return { ...state, isPasswordVerified: false, isLocked: false };
    case 'SET_COMPLEXITY':
      return { ...state, complexityLevel: action.payload };
    case 'SET_SPEECH_RATE':
      return { ...state, speechRate: action.payload };
    case 'UPDATE_ITEM_STATUS':
      return {
        ...state,
        learningItems: state.learningItems.map(item =>
          item.id === action.payload.id ? { ...item, status: action.payload.newStatus } : item
        ),
      };
    default:
      return state;
  }
};

// ============================================================================
// == SECTION 2: CONTEXT DEFINITION
// ============================================================================

interface ILearningContext {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    isInitialized: boolean;
}

const LearningContext = createContext<ILearningContext | undefined>(undefined);

export const useLearningContext = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearningContext must be used within a LearningProvider');
  }
  return context;
};

// ============================================================================
// == SECTION 3: PROVIDER COMPONENT
// ============================================================================

interface LearningProviderProps {
    children: ReactNode;
}

export const LearningProvider: FC<LearningProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem('alphaPlayState');
            if (savedState) {
                const parsedState = JSON.parse(savedState) as AppState;
                dispatch({ type: 'LOAD_STATE', payload: { 
                    ...initialState, 
                    ...parsedState, 
                    isPasswordVerified: false, 
                    isLocked: false, 
                    complexityLevel: parsedState.complexityLevel || 1,
                    speechRate: parsedState.speechRate ?? 0.8,
                } });
            } else {
                 dispatch({ type: 'LOCK' });
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if(isInitialized){
            try {
                localStorage.setItem('alphaPlayState', JSON.stringify(state));
            } catch (error) {
                console.error("Failed to save state to localStorage", error);
            }
        }
    }, [state, isInitialized]);

    const value = { state, dispatch, isInitialized };

    return (
        <LearningContext.Provider value={value}>
            {children}
        </LearningContext.Provider>
    );
};
