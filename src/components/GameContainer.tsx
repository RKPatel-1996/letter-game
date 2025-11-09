// ============================================================================
// == SECTION 0: FILE CONTEXT
// ============================================================================
// This is the main component for the game itself. It orchestrates the game
// logic, including selecting items, handling correct/incorrect answers,
// managing transitions, and displaying feedback to the user.

import React, { useState, useEffect, useCallback, FC } from "react";
import { useLearningContext } from "../context/LearningContext";
import { LearningItem } from "../types";
import PopTheBubbleGame from "./PopTheBubbleGame";
import FullscreenButton from "./ui/FullscreenButton";
import BackgroundBubbles from "./ui/BackgroundBubbles";
import { useSpeech } from "../hooks/useSpeech";
import { shuffleArray } from "../utils/shuffleArray";

const GameContainer: FC = () => {
  const { state, dispatch } = useLearningContext();
  const [gameItems, setGameItems] = useState<LearningItem[]>([]);
  const [correctItem, setCorrectItem] = useState<LearningItem | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "success" | "failure">(
    "idle"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [collectedItems, setCollectedItems] = useState<LearningItem[]>([]);
  const [retestQueue, setRetestQueue] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const { speak, playSuccess, playFailure } = useSpeech();

  const selectNextItems = useCallback(() => {
    let upcomingItemId: string | undefined;
    let nextRetestQueue = [...retestQueue];

    if (nextRetestQueue.length > 0 && Math.random() < 0.5) {
      upcomingItemId = nextRetestQueue.shift(); // Use shift to get the oldest item
      setRetestQueue(nextRetestQueue);
    }

    let newCorrectItem: LearningItem | undefined;

    if (upcomingItemId) {
      newCorrectItem = state.learningItems.find((i) => i.id === upcomingItemId);
    }

    if (!newCorrectItem) {
      const struggling = state.learningItems.filter(
        (i) => i.status === "struggling"
      );
      const notPracticed = state.learningItems.filter(
        (i) => i.status === "not-practiced"
      );
      const learned = state.learningItems.filter((i) => i.status === "learned");

      const rand = Math.random();
      let priorityList: LearningItem[] = [];

      if (rand < 0.6 && struggling.length > 0) priorityList = struggling;
      else if (rand < 0.9 && notPracticed.length > 0)
        priorityList = notPracticed;
      else if (learned.length > 0) priorityList = learned;
      else
        priorityList =
          struggling.length > 0
            ? struggling
            : notPracticed.length > 0
            ? notPracticed
            : learned;

      if (priorityList.length === 0) {
        setCorrectItem(null);
        setGameItems([]);
        return;
      }
      newCorrectItem =
        priorityList[Math.floor(Math.random() * priorityList.length)];
    }

    if (!newCorrectItem) return;

    setCorrectItem(newCorrectItem);

    const numDistractors = state.complexityLevel - 1;
    const potentialDistractors = state.learningItems.filter(
      (i) => i.id !== newCorrectItem!.id
    );
    const shuffledDistractors = shuffleArray(potentialDistractors);
    const distractors = shuffledDistractors.slice(0, numDistractors);

    setGameItems(shuffleArray([newCorrectItem, ...distractors]));
  }, [state.learningItems, state.complexityLevel, retestQueue]);

  useEffect(() => {
    if (gameStarted && !isTransitioning) {
      selectNextItems();
    }
  }, [state.complexityLevel, isTransitioning, gameStarted, selectNextItems]);

  useEffect(() => {
    if (gameStarted) {
      selectNextItems();
    }
  }, [gameStarted, selectNextItems]);

  useEffect(() => {
    if (gameStarted && correctItem && !isTransitioning) {
      const timer = setTimeout(() => {
        speak(correctItem.value, state.speechRate);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, correctItem, isTransitioning, speak, state.speechRate]);

  const handleCorrect = (item: LearningItem) => {
    playSuccess();
    setIsTransitioning(true);
    setFeedback("success");
    setCollectedItems((prev) => [item, ...prev].slice(0, 7));

    setTimeout(() => {
      selectNextItems();
      setFeedback("idle");
      setIsTransitioning(false);
    }, 2000);
  };

  const handleIncorrect = () => {
    playFailure();
    setIsTransitioning(true);
    setIsClearing(true);
    setFeedback("failure");

    if (correctItem) {
      setRetestQueue((prev) => [...prev, correctItem.id]);
    }

    setTimeout(() => {
      setIsClearing(false);
      selectNextItems();
      setFeedback("idle");
      setIsTransitioning(false);
    }, 2000);
  };

  const feedbackColorClass = {
    idle: "from-sky-200 to-sky-400",
    success: "from-green-200 to-green-400",
    failure: "from-red-200 to-red-400",
  }[feedback];

  return (
    <div className="w-screen h-screen bg-sky-300 overflow-hidden relative font-sans">
      <div
        className={`absolute inset-0 bg-gradient-to-b ${feedbackColorClass} transition-colors duration-500`}
      ></div>
      <BackgroundBubbles />
      <FullscreenButton />
      <button
        onClick={() => dispatch({ type: "LOCK" })}
        className="absolute top-4 right-4 bg-yellow-400 text-yellow-800 p-2 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {!gameStarted && (
        <div className="w-full h-full flex flex-col items-center justify-center z-30">
          <h1
            className="text-6xl md:text-8xl font-bold text-white mb-8 animate-pulse"
            style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.4)" }}
          >
            AlphaPlay
          </h1>
          <button
            onClick={() => setGameStarted(true)}
            className="px-12 py-6 bg-green-500 text-white font-bold text-3xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
          >
            Tap to Play!
          </button>
        </div>
      )}

      {gameStarted && isTransitioning && feedback === "success" && (
        <div className="absolute inset-0 flex items-center justify-center animate-feedback z-20 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-48 w-48 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      {gameStarted && isTransitioning && feedback === "failure" && (
        <div className="absolute inset-0 flex items-center justify-center animate-feedback z-20 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-48 w-48 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}

      {gameStarted && correctItem ? (
        <>
          <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4 pointer-events-none">
            <h2
              className="text-8xl md:text-9xl font-bold text-white transition-opacity duration-300"
              style={{
                textShadow: "3px 3px 6px rgba(0,0,0,0.4)",
                opacity: isTransitioning ? 0 : 1,
              }}
            >
              {correctItem.value}
            </h2>
          </div>
          <PopTheBubbleGame
            items={gameItems}
            correctItem={correctItem}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            isTransitioning={isTransitioning}
            isClearing={isClearing}
          />
        </>
      ) : (
        gameStarted && (
          <div className="w-full h-full flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white text-center p-4">
              Congratulations! You've practiced everything!
            </h2>
          </div>
        )
      )}

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black bg-opacity-20 flex items-center justify-center gap-2 md:gap-4 p-2 z-10">
        {collectedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg animate-fade-in-quick"
          >
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameContainer;
