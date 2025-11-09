export type LearningStatus = 'struggling' | 'not-practiced' | 'learned';

export type LearningItemType = 'letter' | 'number' | 'special';

export interface LearningItem {
  id: string;
  value: string;
  type: LearningItemType;
  status: LearningStatus;
}

export interface AppState {
  learningItems: LearningItem[];
  parentPassword: string | null;
  isLocked: boolean;
  isPasswordVerified: boolean;
  complexityLevel: number;
  speechRate: number;
}

export type AppAction =
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'UNLOCK' }
  | { type: 'LOCK' }
  | { type: 'EXIT_TO_GAME' }
  | { type: 'UPDATE_ITEM_STATUS'; payload: { id: string; newStatus: LearningStatus } }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_COMPLEXITY'; payload: number }
  | { type: 'SET_SPEECH_RATE'; payload: number };
