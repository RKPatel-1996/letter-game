// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// A purely decorative UI component that renders animated bubbles rising
// in the background of the game screen for a more engaging visual effect.

import React, { useMemo, FC } from 'react';

const BackgroundBubbles: FC = React.memo(() => {
    const bubbles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        style: {
            left: `${Math.random() * 100}vw`,
            width: `${20 + Math.random() * 60}px`,
            height: `${20 + Math.random() * 60}px`,
            animationDuration: `${10 + Math.random() * 15}s`,
            animationDelay: `${Math.random() * 10}s`,
        }
    })), []);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {bubbles.map(bubble => (
                <div key={bubble.id} className="absolute bottom-[-100px] rounded-full bg-white bg-opacity-10 animate-rise" style={bubble.style}></div>
            ))}
        </div>
    );
});

export default BackgroundBubbles;
