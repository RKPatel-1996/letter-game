// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// A modal component that gates access to the settings dashboard. It handles
// both the initial creation of a parent password and subsequent unlocking.

import React, { useState, FC } from 'react';
import { useLearningContext } from '../context/LearningContext';

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

export default ParentalLockModal;
