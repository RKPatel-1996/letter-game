import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useMemo, FC } from 'react';
import { LearningItem, AppState, AppAction, LearningStatus } from './types';
import { INITIAL_LEARNING_ITEMS } from './constants';

// ============================================================================
// == SECTION 1: STATE MANAGEMENT (Reducer, Context, Initial State)
// ============================================================================

const initialState: AppState = {
  learningItems: INITIAL_LEARNING_ITEMS,
  parentPassword: null,
  isLocked: false, // Default to unlocked, modal shows on action
  isPasswordVerified: false,
  complexityLevel: 1, // Default to easy (1 item)
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

const LearningContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

const useLearningContext = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearningContext must be used within a LearningProvider');
  }
  return context;
};

// ============================================================================
// == SECTION 2: HELPER & UI COMPONENTS
// ============================================================================

// Custom hook for playing audio safely
const useAudio = () => {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const play = useCallback((src: string) => {
        if (!src) return;
        try {
            // Stop any currently playing audio from this hook instance to prevent overlap
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            const audio = new Audio(src);
            audioRef.current = audio;
            audio.play().catch(e => console.error(`Could not play audio: ${src}`, e.message));
        } catch (e) {
            console.error(`Error creating audio object for: ${src}`, e);
        }
    }, []);
    
    return play;
};


const FullscreenButton: FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <button onClick={toggleFullscreen} className="absolute top-4 right-20 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 z-50">
      {isFullscreen ? (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m7 2l5-5m0 0h-4m4 0v4M4 16v4m0 0h4m-4 0l5-5m7 2l5 5m0 0h-4m4 0v-4" /></svg>
      )}
    </button>
  );
};

interface LearningItemRowProps {
  item: LearningItem;
}

const LearningItemRow: FC<LearningItemRowProps> = ({ item }) => {
    const { dispatch } = useLearningContext();

    const setStatus = (newStatus: LearningStatus) => {
        dispatch({ type: 'UPDATE_ITEM_STATUS', payload: { id: item.id, newStatus } });
    };

    const statusButtonClasses = (status: LearningStatus) => {
        const base = 'w-10 h-10 flex items-center justify-center rounded-full font-bold text-xl transition-all';
        if (item.status === status) {
            return {
                'struggling': 'bg-red-500 text-white scale-110 shadow-lg',
                'not-practiced': 'bg-blue-500 text-white scale-110 shadow-lg',
                'learned': 'bg-green-500 text-white scale-110 shadow-lg',
            }[status];
        }
        return 'bg-gray-200 text-gray-500 hover:bg-gray-300';
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <span className="text-3xl font-bold text-gray-700 w-12 text-center">{item.value}</span>
            <div className="flex items-center gap-3">
                <button onClick={() => setStatus('struggling')} className={statusButtonClasses('struggling')}>✖</button>
                <button onClick={() => setStatus('not-practiced')} className={statusButtonClasses('not-practiced')}>?</button>
                <button onClick={() => setStatus('learned')} className={statusButtonClasses('learned')}>✔</button>
            </div>
        </div>
    );
};

// ============================================================================
// == SECTION 3: CORE FEATURE COMPONENTS
// ============================================================================

const SettingsDashboard: FC = () => {
    const { state, dispatch } = useLearningContext();

    const complexityLevels = [
        { label: 'Easy', value: 1 },
        { label: 'Medium', value: 2 },
        { label: 'Hard', value: 3 },
        { label: 'Advanced', value: 5 },
    ];

    const sortedItems = useMemo(() => 
        [...state.learningItems].sort((a, b) => a.value.localeCompare(b.value)),
    [state.learningItems]);

    return (
        <div className="min-h-screen bg-slate-200 p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">Parental Dashboard</h1>
                    <button onClick={() => dispatch({ type: 'EXIT_TO_GAME' })} className="px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors">
                        Lock & Exit
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Game Complexity</h2>
                    <p className="text-gray-600 mb-4">Choose how many options your child sees at one time.</p>
                    <div className="flex flex-wrap gap-3">
                        {complexityLevels.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => dispatch({ type: 'SET_COMPLEXITY', payload: value })}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    state.complexityLevel === value
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {label} ({value})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                     <h2 className="text-2xl font-bold text-gray-700 mb-4">Learning Items</h2>
                     <p className="text-gray-600 mb-4">Set the status for each item.</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {sortedItems.map(item => <LearningItemRow key={item.id} item={item} />)}
                     </div>
                </div>
            </div>
        </div>
    );
};

const ParentalLockModal: FC = () => {
    const { state, dispatch } = useLearningContext();
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.parentPassword) {
            // Setting password for the first time
            if (passwordInput.length < 4) {
                setError('Password must be at least 4 characters long.');
                return;
            }
            dispatch({ type: 'SET_PASSWORD', payload: passwordInput });
        } else {
            // Unlocking
            if (passwordInput === state.parentPassword) {
                dispatch({ type: 'UNLOCK' });
            } else {
                setError('Incorrect password. Please try again.');
                setPasswordInput('');
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    {state.parentPassword ? 'Enter Parent Password' : 'Create Parent Password'}
                </h2>
                <p className="text-gray-600 mb-6">
                    {state.parentPassword ? 'Access requires your password.' : 'Create a password to protect settings.'}
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => {
                            setPasswordInput(e.target.value);
                            setError('');
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        autoFocus
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <button type="submit" className="w-full mt-6 px-6 py-3 bg-green-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-600 transition-colors">
                        {state.parentPassword ? 'Unlock' : 'Set Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

interface PopTheBubbleGameProps {
  items: LearningItem[];
  correctItem: LearningItem;
  onCorrect: (item: LearningItem) => void;
  onIncorrect: (item: LearningItem) => void;
  isTransitioning: boolean;
  isClearing: boolean;
}

const PopTheBubbleGame: FC<PopTheBubbleGameProps> = ({ items, correctItem, onCorrect, onIncorrect, isTransitioning, isClearing }) => {
    const [poppingId, setPoppingId] = useState<string | null>(null);

    const handleClick = (item: LearningItem) => {
        if (isTransitioning || poppingId) return;

        if (item.id === correctItem.id) {
            setPoppingId(item.id);
            onCorrect(item);
        } else {
            onIncorrect(item);
        }
    };
    
    // Reset poppingId when items change to allow new items to be clicked
    useEffect(() => {
        setPoppingId(null);
    }, [items]);

    return (
        <div className="w-full h-full flex items-center justify-center flex-wrap gap-8 p-4">
             {items.map(item => {
                const isPopping = poppingId === item.id;
                const shouldClear = isClearing && !isPopping;
                return (
                    <div 
                        key={item.id} 
                        className={`relative flex items-center justify-center select-none transition-transform duration-300 ${!isPopping && !shouldClear ? 'animate-float cursor-pointer' : ''}`}
                        onClick={() => handleClick(item)}
                        style={{ 
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${6 + Math.random() * 2}s`
                        }}
                    >
                        <svg viewBox="0 0 200 200" className={`w-40 h-40 md:w-56 md:h-56 ${isPopping || shouldClear ? 'animate-pop-bubble' : ''}`}>
                            <circle cx="100" cy="100" r="80" fill="#87CEEB" opacity="0.7"/>
                            <circle cx="100" cy="100" r="80" stroke="#FFFFFF" strokeWidth="3" fill="none"/>
                            <path d="M 60 80 A 40 40 0 0 1 100 60" stroke="white" strokeWidth="4" fill="none" opacity="0.8"/>
                        </svg>
                        <span className={`absolute text-white font-bold text-6xl md:text-8xl ${isPopping ? 'animate-fall' : ''} ${shouldClear ? 'opacity-0' : ''}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            {item.value}
                        </span>
                    </div>
                );
             })}
        </div>
    );
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const GameContainer: FC = () => {
    const { state, dispatch } = useLearningContext();
    const [gameItems, setGameItems] = useState<LearningItem[]>([]);
    const [correctItem, setCorrectItem] = useState<LearningItem | null>(null);
    const [feedback, setFeedback] = useState<'idle' | 'success' | 'failure'>('idle');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [collectedItems, setCollectedItems] = useState<LearningItem[]>([]);
    const [retestQueue, setRetestQueue] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const playAudio = useAudio();

    const selectNextItems = useCallback(() => {
        let upcomingItemId: string | undefined;
        let nextRetestQueue = [...retestQueue];

        if (nextRetestQueue.length > 0 && Math.random() < 0.5) {
            upcomingItemId = nextRetestQueue.shift(); // Use shift to get the oldest item
            setRetestQueue(nextRetestQueue);
        }

        let newCorrectItem: LearningItem | undefined;

        if (upcomingItemId) {
            newCorrectItem = state.learningItems.find(i => i.id === upcomingItemId);
        }

        if (!newCorrectItem) {
            const struggling = state.learningItems.filter(i => i.status === 'struggling');
            const notPracticed = state.learningItems.filter(i => i.status === 'not-practiced');
            const learned = state.learningItems.filter(i => i.status === 'learned');

            const rand = Math.random();
            let priorityList: LearningItem[] = [];

            if (rand < 0.6 && struggling.length > 0) priorityList = struggling;
            else if (rand < 0.9 && notPracticed.length > 0) priorityList = notPracticed;
            else if (learned.length > 0) priorityList = learned;
            else priorityList = struggling.length > 0 ? struggling : (notPracticed.length > 0 ? notPracticed : learned);

            if (priorityList.length === 0) {
                setCorrectItem(null);
                setGameItems([]);
                return;
            }
            newCorrectItem = priorityList[Math.floor(Math.random() * priorityList.length)];
        }

        if (!newCorrectItem) return;
        
        setCorrectItem(newCorrectItem);

        const numDistractors = state.complexityLevel - 1;
        const potentialDistractors = state.learningItems.filter(i => i.id !== newCorrectItem!.id);
        const shuffledDistractors = shuffleArray(potentialDistractors);
        const distractors = shuffledDistractors.slice(0, numDistractors);

        setGameItems(shuffleArray([newCorrectItem, ...distractors]));
        
    }, [state.learningItems, state.complexityLevel, retestQueue]);

    useEffect(() => {
        if (gameStarted && !isTransitioning) {
            selectNextItems();
        }
    }, [state.complexityLevel, isTransitioning, gameStarted]);

    useEffect(() => {
        if (gameStarted) {
           selectNextItems();
        }
    }, [gameStarted]);
    
    useEffect(() => {
        if (gameStarted && correctItem && !isTransitioning) {
            const timer = setTimeout(() => {
                playAudio(correctItem.audioSrc);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [gameStarted, correctItem, isTransitioning, playAudio]);

    const handleCorrect = (item: LearningItem) => {
        playAudio('/audio/correct.mp3');
        setIsTransitioning(true);
        setFeedback('success');
        setCollectedItems(prev => [item, ...prev].slice(0, 7));

        setTimeout(() => {
            selectNextItems();
            setFeedback('idle');
            setIsTransitioning(false);
        }, 2000);
    };

    const handleIncorrect = () => {
        playAudio('/audio/wrong.mp3');
        setIsTransitioning(true);
        setIsClearing(true);
        setFeedback('failure');

        if (correctItem) {
            setRetestQueue(prev => [...prev, correctItem.id]);
        }
        
        setTimeout(() => {
            setIsClearing(false);
            selectNextItems();
            setFeedback('idle');
            setIsTransitioning(false);
        }, 2000);
    };

    const feedbackColorClass = {
        idle: 'from-sky-200 to-sky-400',
        success: 'from-green-200 to-green-400',
        failure: 'from-red-200 to-red-400',
    }[feedback];

    return (
        <div className="w-screen h-screen bg-sky-300 overflow-hidden relative font-sans">
            <div className={`absolute inset-0 bg-gradient-to-b ${feedbackColorClass} transition-colors duration-500`}></div>
            <FullscreenButton />
            <button onClick={() => dispatch({ type: 'LOCK' })} className="absolute top-4 right-4 bg-yellow-400 text-yellow-800 p-2 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 z-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>

            {!gameStarted && (
                 <div className="w-full h-full flex flex-col items-center justify-center z-30">
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-pulse" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.4)'}}>AlphaPlay</h1>
                    <button 
                        onClick={() => setGameStarted(true)} 
                        className="px-12 py-6 bg-green-500 text-white font-bold text-3xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
                    >
                        Tap to Play!
                    </button>
                </div>
            )}

            {gameStarted && isTransitioning && feedback === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center animate-feedback z-20 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            )}
            {gameStarted && isTransitioning && feedback === 'failure' && (
                 <div className="absolute inset-0 flex items-center justify-center animate-feedback z-20 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            )}

            {gameStarted && correctItem ? (
                <>
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-white transition-opacity duration-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)', opacity: isTransitioning ? 0 : 1 }}>
                            Find "{correctItem.value}"!
                        </h2>
                    </div>
                    <PopTheBubbleGame items={gameItems} correctItem={correctItem} onCorrect={handleCorrect} onIncorrect={handleIncorrect} isTransitioning={isTransitioning} isClearing={isClearing} />
                </>
            ) : (
                gameStarted && <div className="w-full h-full flex items-center justify-center">
                    <h2 className="text-4xl font-bold text-white text-center p-4">Congratulations! You've practiced everything!</h2>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-24 bg-black bg-opacity-20 flex items-center justify-center gap-2 md:gap-4 p-2 z-10">
                {collectedItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg animate-fade-in-quick">
                        {item.value}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// == SECTION 4: MAIN APP COMPONENT
// ============================================================================

const App: FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem('alphaPlayState');
            if (savedState) {
                const parsedState = JSON.parse(savedState) as AppState;
                dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsedState, isPasswordVerified: false, isLocked: false, complexityLevel: parsedState.complexityLevel || 1 } });
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

    if (!isInitialized) {
        return <div className="w-screen h-screen bg-sky-300 flex items-center justify-center"><h1 className="text-4xl text-white">Loading AlphaPlay...</h1></div>;
    }

    return (
        <LearningContext.Provider value={{ state, dispatch }}>
            {state.isLocked && <ParentalLockModal />}

            {state.isPasswordVerified ? (
                <SettingsDashboard />
            ) : (
                <GameContainer />
            )}
        </LearningContext.Provider>
    );
};

export default App;
