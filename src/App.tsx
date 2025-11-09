// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// This is the root component of the application. Its main responsibility is
// to provide the global state context and to orchestrate which primary view
// (Game or Settings) is currently visible based on the app's state.

import React, { FC } from 'react';
import { LearningProvider, useLearningContext } from './context/LearningContext';
import GameContainer from './components/GameContainer';
import SettingsDashboard from './components/SettingsDashboard';
import ParentalLockModal from './components/ParentalLockModal';

// ============================================================================
// == SECTION 1: APP CONTENT WRAPPER
// ============================================================================
// This component consumes the context to access the application state.
// It handles the main logic for displaying loading screens, the parental
// lock modal, and switching between the game and settings dashboard.

const AppContent: FC = () => {
    const { state, isInitialized } = useLearningContext();

    if (!isInitialized) {
        return <div className="w-screen h-screen bg-sky-300 flex items-center justify-center"><h1 className="text-4xl text-white">Loading AlphaPlay...</h1></div>;
    }

    return (
        <>
            {/* The modal logic remains the same, it overlays everything */}
            {state.isLocked && <ParentalLockModal />}

            {/* This is the fix for potential unmounting animation crashes.
              Instead of conditionally rendering (mounting/unmounting) the two main
              components, we render BOTH and use CSS `display` to hide one.
            */}
            <div style={{ display: state.isPasswordVerified ? 'none' : 'block', height: '100%', width: '100%' }}>
                <GameContainer />
            </div>
            <div style={{ display: state.isPasswordVerified ? 'block' : 'none', height: '100%', width: '100%' }}>
                <SettingsDashboard />
            </div>
        </>
    );
};

// ============================================================================
// == SECTION 2: MAIN APP COMPONENT
// ============================================================================
// The final App component simply wraps the AppContent with the LearningProvider,
// making the global state available to all its children.

const App: FC = () => {
    return (
        <LearningProvider>
            <AppContent />
        </LearningProvider>
    );
};

export default App;
