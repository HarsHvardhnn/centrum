import React, { useEffect, useState, useCallback } from "react";
import { HeartPulse, Globe } from "lucide-react";
import { useNavigation } from "../../utils/useNavigate";

const translations = {
  en: {
    title: "Hmm... Something's Not Quite Right",
    message: "We're not quite sure what you're looking for. Let's get you back to a safe place.",
    backToLogin: "Back to Login",
    gameTitle: "While you wait...",
    gameInstructions: "Use arrow keys or touch to catch the pills!",
    score: "Score",
    language: "Language"
  },
  pl: {
    title: "Hmm... Coś Poszło Nie Tak",
    message: "Nie jesteśmy pewni, czego szukasz. Zabierzmy Cię w bezpieczne miejsce.",
    backToLogin: "Powrót do Logowania",
    gameTitle: "Podczas oczekiwania...",
    gameInstructions: "Użyj strzałek lub dotyku, aby złapać pigułki!",
    score: "Wynik",
    language: "Język"
  }
};

const Game = () => {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState(50);
  const [pillPosition, setPillPosition] = useState({ x: 50, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);

  const moveContainer = useCallback((direction) => {
    setPosition(prev => {
      const newPos = direction === 'left' ? prev - 5 : prev + 5;
      return Math.max(0, Math.min(90, newPos));
    });
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') moveContainer('left');
      if (e.key === 'ArrowRight') moveContainer('right');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, moveContainer]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      setPillPosition(prev => {
        // If pill reached bottom
        if (prev.y >= 90) {
          // Check if caught
          if (Math.abs(prev.x - position) < 10) {
            setScore(s => s + 1);
          }
          // Reset pill
          return { x: Math.random() * 90, y: 0 };
        }
        // Move pill down
        return { ...prev, y: prev.y + 2 };
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameStarted, position]);

  if (!gameStarted) {
    return (
      <button
        onClick={() => setGameStarted(true)}
        className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
      >
        Start Game
      </button>
    );
  }

  return (
    <div className="relative w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 text-teal-600 font-bold">
        Score: {score}
      </div>
      {/* Falling Pill */}
      <div
        className="absolute w-6 h-6 bg-teal-500 rounded-full"
        style={{ left: `${pillPosition.x}%`, top: `${pillPosition.y}%` }}
      />
      {/* Container */}
      <div
        className="absolute bottom-0 w-12 h-6 bg-white border-2 border-teal-500 rounded"
        style={{ left: `${position}%` }}
      />
      {/* Touch Controls */}
      <div className="absolute bottom-0 left-0 w-1/2 h-full" onClick={() => moveContainer('left')} />
      <div className="absolute bottom-0 right-0 w-1/2 h-full" onClick={() => moveContainer('right')} />
    </div>
  );
};

export default function NotFound404() {
  const [lang, setLang] = useState('pl');
  const { navigate } = useNavigation();
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-teal-100 rounded-full opacity-20"></div>
      </div>

      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-20">
        <button
          onClick={() => setLang(lang === 'en' ? 'pl' : 'en')}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <Globe className="h-5 w-5 text-teal-500" />
          <span className="text-teal-500">{t.language}</span>
        </button>
      </div>

      {/* Hospital Logo */}
      <div className="fixed top-6 left-6 flex items-center z-10">
        <div className="bg-teal-500 rounded-full p-3">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 text-teal-500 font-medium text-xl">
          Northern Central Clinic
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          {t.title}
        </h1>

        <p className="text-xl text-gray-600 text-center mb-8">
          {t.message}
        </p>

        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-lg mb-12"
        >
          {t.backToLogin}
        </button>

        {/* Game Section */}
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-2">{t.gameTitle}</h2>
          <p className="text-gray-600 text-center mb-4">{t.gameInstructions}</p>
          <div className="flex justify-center">
            <Game />
          </div>
        </div>
      </div>
    </div>
  );
}
