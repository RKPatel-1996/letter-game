// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// This component is the main view for the parental settings area. It allows
// parents to configure game complexity and manage the learning status of
// each individual character.

import React, { useMemo, FC } from 'react';
import { useLearningContext } from '../context/LearningContext';
import LearningItemRow from './ui/LearningItemRow';

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

                <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Audio Settings</h2>
                    <label htmlFor="speech-rate" className="block text-gray-600 mb-2">
                        Announcement Speed: <span className="font-bold text-slate-700">{state.speechRate.toFixed(1)}</span>
                    </label>
                    <input
                        id="speech-rate"
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={state.speechRate}
                        onChange={(e) => dispatch({ type: 'SET_SPEECH_RATE', payload: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Slower</span>
                        <span>Faster</span>
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

export default SettingsDashboard;
