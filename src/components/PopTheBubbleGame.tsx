// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// The core interactive element of the game. It displays the floating
// bubbles with characters inside and handles click events, animations,
// and reporting success/failure back to the GameContainer.

import { useState, useEffect, FC } from "react";
import { LearningItem } from "../types";

interface PopTheBubbleGameProps {
  items: LearningItem[];
  correctItem: LearningItem;
  onCorrect: (item: LearningItem) => void;
  onIncorrect: (item: LearningItem) => void;
  isTransitioning: boolean;
  isClearing: boolean;
}

const PopTheBubbleGame: FC<PopTheBubbleGameProps> = ({
  items,
  correctItem,
  onCorrect,
  onIncorrect,
  isTransitioning,
  isClearing,
}) => {
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
      {items.map((item) => {
        const isPopping = poppingId === item.id;
        const shouldClear = isClearing && !isPopping;
        return (
          <div
            key={item.id}
            className={`relative flex items-center justify-center select-none transition-transform duration-300 ${
              !isPopping && !shouldClear ? "animate-float cursor-pointer" : ""
            }`}
            onClick={() => handleClick(item)}
            style={{
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${6 + Math.random() * 2}s`,
            }}
          >
            <svg
              viewBox="0 0 200 200"
              className={`w-40 h-40 md:w-56 md:h-56 ${
                isPopping || shouldClear ? "animate-pop-bubble" : ""
              }`}
            >
              <defs>
                <radialGradient
                  id="bubbleGradient"
                  cx="0.35"
                  cy="0.35"
                  r="0.65"
                >
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
                  <stop offset="100%" stopColor="rgba(135, 206, 235, 0.2)" />
                </radialGradient>
              </defs>
              {/* Main bubble body with gradient */}
              <circle cx="100" cy="100" r="80" fill="url(#bubbleGradient)" />
              {/* A subtle outer highlight to give it an edge */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="3"
                fill="none"
              />
              {/* The classic sharp reflection */}
              <path
                d="M 65 75 A 35 35 0 0 1 100 60"
                stroke="white"
                strokeWidth="5"
                fill="none"
                opacity="0.8"
              />
            </svg>
            <span
              className={`absolute text-white font-bold text-6xl md:text-8xl ${
                isPopping ? "animate-fall" : ""
              } ${shouldClear ? "opacity-0" : ""}`}
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
            >
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PopTheBubbleGame;
