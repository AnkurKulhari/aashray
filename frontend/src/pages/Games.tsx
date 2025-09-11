import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Trophy, Heart, Zap, Brain } from 'lucide-react';

const Games: React.FC = () => {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stress Relief Games</h1>
        <p className="text-gray-600">Interactive activities to help you relax and unwind</p>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BreathingExercise />
        <MemoryGame />
        <ColorTherapy />
        <MindfulnessTimer />
        <ProgressiveRelaxation />
        <FocusGame />
        <PocketRacing />
        <FishFrenzy />
        <BlockBusterBlitz />
        <TreasureOfApes />
        <SweetPenguin />
        <ColorfulBeetles />
      </div>

      {/* Benefits Section */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Stress Relief Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Reduces Anxiety</h3>
            <p className="text-sm text-gray-600">Calms the nervous system</p>
          </div>
          <div className="text-center">
            <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Improves Focus</h3>
            <p className="text-sm text-gray-600">Enhances concentration</p>
          </div>
          <div className="text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Boosts Energy</h3>
            <p className="text-sm text-gray-600">Reduces mental fatigue</p>
          </div>
          <div className="text-center">
            <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Builds Resilience</h3>
            <p className="text-sm text-gray-600">Develops coping skills</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Breathing Exercise Component
const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount === 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return 4;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 6;
            } else {
              setPhase('inhale');
              return 4;
            }
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(4);
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">4-7-8 Breathing</h3>
        <p className="text-sm text-gray-600 mb-4">Calm your mind with guided breathing</p>
        
        <div className="mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-1000 ${
            phase === 'inhale' ? 'bg-blue-500 scale-110' : 
            phase === 'hold' ? 'bg-purple-500 scale-100' : 
            'bg-green-500 scale-90'
          }`}>
            {count}
          </div>
          <p className="mt-3 text-lg font-medium text-gray-800 capitalize">
            {phase === 'hold' ? 'Hold' : phase}
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <button onClick={handleStart} className="btn-primary flex items-center space-x-2">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>
          <button onClick={handleReset} className="btn-secondary flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Memory Game Component
const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Array<{id: number, value: string, flipped: boolean, matched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = () => {
    const emojis = ['🌟', '🌺', '🦋', '🌈', '🍀', '🌙', '⭐', '🌸'];
    const gameCards = [...emojis, ...emojis].map((emoji, index) => ({
      id: index,
      value: emoji,
      flipped: false,
      matched: false
    })).sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlippedCards([]);
    setScore(0);
    setGameStarted(true);
  };

  const handleCardClick = (id: number) => {
    if (!gameStarted || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c => 
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      if (firstCard?.value === secondCard?.value) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, matched: true } : c
          ));
          setScore(prev => prev + 1);
          setFlippedCards([]);
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Memory Match</h3>
        <p className="text-sm text-gray-600 mb-4">Exercise your brain and improve focus</p>
        
        {gameStarted && (
          <p className="mb-4 font-medium text-purple-600">Matches: {score}/8</p>
        )}

        {!gameStarted ? (
          <button onClick={initializeGame} className="btn-primary">
            Start Game
          </button>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square rounded-lg text-xl font-bold transition-all duration-300 ${
                    card.flipped || card.matched
                      ? 'bg-white shadow-md'
                      : 'bg-purple-200 hover:bg-purple-300'
                  }`}
                >
                  {card.flipped || card.matched ? card.value : '?'}
                </button>
              ))}
            </div>
            <button onClick={initializeGame} className="btn-secondary">
              New Game
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Color Therapy Component
const ColorTherapy: React.FC = () => {
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const colors = [
    { color: '#3B82F6', name: 'Calm Blue', benefit: 'Reduces stress' },
    { color: '#10B981', name: 'Nature Green', benefit: 'Promotes balance' },
    { color: '#8B5CF6', name: 'Peaceful Purple', benefit: 'Enhances creativity' },
    { color: '#F59E0B', name: 'Warm Orange', benefit: 'Boosts energy' },
    { color: '#EF4444', name: 'Passionate Red', benefit: 'Increases confidence' },
    { color: '#06B6D4', name: 'Tranquil Teal', benefit: 'Soothes anxiety' }
  ];

  return (
    <div className="card p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Color Therapy</h3>
        <p className="text-sm text-gray-600 mb-4">Focus on colors to improve your mood</p>
        
        <div 
          className="w-32 h-32 mx-auto rounded-full mb-4 transition-colors duration-500 shadow-lg"
          style={{ backgroundColor: currentColor }}
        ></div>
        
        <div className="mb-4">
          <p className="font-medium text-gray-900">
            {colors.find(c => c.color === currentColor)?.name}
          </p>
          <p className="text-sm text-gray-600">
            {colors.find(c => c.color === currentColor)?.benefit}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {colors.map(({ color, name }) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Mindfulness Timer Component
const MindfulnessTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(5 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            // Timer completed - could add notification
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const startTimer = (mins: number) => {
    setMinutes(mins);
    setSeconds(0);
    setTotalTime(mins * 60);
    setIsActive(true);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(5);
    setSeconds(0);
  };

  const progress = totalTime > 0 ? ((totalTime - (minutes * 60 + seconds)) / totalTime) * 100 : 0;

  return (
    <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mindfulness Timer</h3>
        <p className="text-sm text-gray-600 mb-4">Take a moment to be present</p>
        
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#10B981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-2 mb-4">
          <button onClick={() => startTimer(3)} className="btn-secondary text-xs px-2 py-1">3m</button>
          <button onClick={() => startTimer(5)} className="btn-secondary text-xs px-2 py-1">5m</button>
          <button onClick={() => startTimer(10)} className="btn-secondary text-xs px-2 py-1">10m</button>
        </div>

        <div className="flex justify-center space-x-3">
          <button onClick={toggleTimer} className="btn-primary flex items-center space-x-2">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>
          <button onClick={resetTimer} className="btn-secondary flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Progressive Relaxation Component
const ProgressiveRelaxation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const steps = [
    'Close your eyes and take a deep breath',
    'Tense your facial muscles for 5 seconds',
    'Relax your face and notice the difference',
    'Tense your shoulders and arms',
    'Relax your upper body completely',
    'Tense your hands into fists',
    'Relax your hands and arms',
    'Tense your chest and stomach',
    'Relax your core muscles',
    'Tense your legs and feet',
    'Relax your entire lower body',
    'Take three deep breaths and open your eyes'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 8000); // 8 seconds per step
    }

    if (currentStep >= steps.length - 1) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentStep, steps.length]);

  const startExercise = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Progressive Relaxation</h3>
        <p className="text-sm text-gray-600 mb-4">Release tension throughout your body</p>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
        </div>

        <div className="mb-6 min-h-[50px] flex items-center justify-center">
          <p className="text-gray-800 font-medium text-center">
            {steps[currentStep]}
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          {!isActive ? (
            <button onClick={startExercise} className="btn-primary flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Start Exercise</span>
            </button>
          ) : (
            <button onClick={resetExercise} className="btn-secondary flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Focus Game Component
const FocusGame: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayerSequence([]);
    setScore(0);
    setIsPlaying(true);
    setGameOver(false);
    setShowingSequence(true);
  };

  const nextRound = () => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setShowingSequence(true);
    setScore(score + 1);
  };

  useEffect(() => {
    if (showingSequence && sequence.length > 0) {
      sequence.forEach((color, index) => {
        setTimeout(() => {
          setActiveButton(color);
          setTimeout(() => {
            setActiveButton(null);
            if (index === sequence.length - 1) {
              setShowingSequence(false);
            }
          }, 600);
        }, index * 1000);
      });
    }
  }, [showingSequence, sequence]);

  const handleButtonClick = (colorIndex: number) => {
    if (showingSequence || !isPlaying) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setTimeout(nextRound, 1000);
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Focus Challenge</h3>
        <p className="text-sm text-gray-600 mb-4">Remember and repeat the sequence</p>
        
        {isPlaying && (
          <p className="mb-4 font-medium text-orange-600">Score: {score}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {colors.map((colorClass, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={`aspect-square rounded-lg transition-all duration-150 ${colorClass} ${
                activeButton === index ? 'scale-110 brightness-150' : 'hover:scale-105'
              } ${showingSequence ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={showingSequence || !isPlaying}
            />
          ))}
        </div>

        {gameOver && (
          <p className="text-red-600 mb-4">Game Over! Final Score: {score}</p>
        )}

        <button 
          onClick={startGame}
          className="btn-primary"
          disabled={isPlaying && !gameOver}
        >
          {!isPlaying || gameOver ? 'Start Game' : 'Game in Progress...'}
        </button>
      </div>
    </div>
  );
};

// Pocket Racing 2 - Racing game
const PocketRacing: React.FC = () => {
  const openGame = () => {
    const gameWindow = window.open(
      'https://www.crazygames.com/game/pocket-racing-2',
      'PocketRacing2',
      'width=1000,height=700,scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no'
    );
    
    if (gameWindow) {
      gameWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.open('https://www.crazygames.com/game/pocket-racing-2', '_blank');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-red-50 to-orange-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pocket Racing 2</h3>
        <p className="text-sm text-gray-600 mb-4">Fast-paced racing game to boost focus and reflexes</p>
        
        <div className="space-y-4">
          <div className="text-6xl mb-4">🏁</div>
          <button onClick={openGame} className="btn-primary w-full">
            Play in New Window
          </button>
          <p className="text-xs text-gray-500">
            Opens in a popup window for the best gaming experience
          </p>
        </div>
      </div>
    </div>
  );
};

// Fish Frenzy - Relaxing underwater game
const FishFrenzy: React.FC = () => {
  const openGame = () => {
    const gameWindow = window.open(
      'https://www.addictinggames.com/funny/fishenoid',
      'FishFrenzy',
      'width=1000,height=700,scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no'
    );
    
    if (gameWindow) {
      gameWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.open('https://www.addictinggames.com/funny/fishenoid', '_blank');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Fish Frenzy</h3>
        <p className="text-sm text-gray-600 mb-4">Relaxing underwater adventure game</p>
        
        <div className="space-y-4">
          <div className="text-6xl mb-4">🐟</div>
          <button onClick={openGame} className="btn-primary w-full">
            Play in New Window
          </button>
          <p className="text-xs text-gray-500">
            Opens in a popup window for the best gaming experience
          </p>
        </div>
      </div>
    </div>
  );
};

// Block Buster Blitz - Satisfying puzzle game
const BlockBusterBlitz: React.FC = () => {
  const openGame = () => {
    const gameWindow = window.open(
      'https://www.crazygames.com/game/bloxorz',
      'BlockBusterBlitz',
      'width=1000,height=700,scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no'
    );
    
    if (gameWindow) {
      gameWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.open('https://www.crazygames.com/game/bloxorz', '_blank');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Block Buster Blitz</h3>
        <p className="text-sm text-gray-600 mb-4">Satisfying block-breaking puzzle game</p>
        
        <div className="space-y-4">
          <div className="text-6xl mb-4">🧩</div>
          <button onClick={openGame} className="btn-primary w-full">
            Play in New Window
          </button>
          <p className="text-xs text-gray-500">
            Opens in a popup window for the best gaming experience
          </p>
        </div>
      </div>
    </div>
  );
};

// Treasure of the Apes - Adventure puzzle game
const TreasureOfApes: React.FC = () => {
  const openGame = () => {
    const gameWindow = window.open(
      'https://www.crazygames.com/game/fireboy-and-watergirl-the-forest-temple',
      'TreasureOfApes',
      'width=1000,height=700,scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no'
    );
    
    if (gameWindow) {
      gameWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.open('https://www.crazygames.com/game/fireboy-and-watergirl-the-forest-temple', '_blank');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Treasure of the Apes</h3>
        <p className="text-sm text-gray-600 mb-4">Adventure puzzle game for mental stimulation</p>
        
        <div className="space-y-4">
          <div className="text-6xl mb-4">🐵💰</div>
          <button onClick={openGame} className="btn-primary w-full">
            Play in New Window
          </button>
          <p className="text-xs text-gray-500">
            Opens in a popup window for the best gaming experience
          </p>
        </div>
      </div>
    </div>
  );
};

// Sweet Penguin - Cute calming game
const SweetPenguin: React.FC = () => {
  const openGame = () => {
    const gameWindow = window.open(
      'https://www.crazygames.com/game/bad-ice-cream',
      'SweetPenguin',
      'width=1000,height=700,scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no'
    );
    
    if (gameWindow) {
      gameWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.open('https://www.crazygames.com/game/bad-ice-cream', '_blank');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sweet Penguin</h3>
        <p className="text-sm text-gray-600 mb-4">Cute and calming penguin adventure</p>
        
        <div className="space-y-4">
          <div className="text-6xl mb-4">🐧🍭</div>
          <button onClick={openGame} className="btn-primary w-full">
            Play in New Window
          </button>
          <p className="text-xs text-gray-500">
            Opens in a popup window for the best gaming experience
          </p>
        </div>
      </div>
    </div>
  );
};

// Colorful Beetles - Matching game for relaxation
const ColorfulBeetles: React.FC = () => {
  const openGame = () => {
    const gameWindow = window.open(
      'https://www.crazygames.com/game/candy-crush-saga',
      'ColorfulBeetles',
      'width=1000,height=700,scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no'
    );
    
    if (gameWindow) {
      gameWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.open('https://www.crazygames.com/game/candy-crush-saga', '_blank');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Colorful Beetles</h3>
        <p className="text-sm text-gray-600 mb-4">Colorful matching game for relaxation</p>
        
        <div className="space-y-4">
          <div className="text-6xl mb-4">🪲🌈</div>
          <button onClick={openGame} className="btn-primary w-full">
            Play in New Window
          </button>
          <p className="text-xs text-gray-500">
            Opens in a popup window for the best gaming experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Games;
