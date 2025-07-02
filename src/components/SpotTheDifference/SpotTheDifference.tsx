import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Clock, Star, Play, RotateCcw, Eye, Users } from 'lucide-react';

const SpotTheDifferenceGame = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, levelComplete
  const [foundDifferences, setFoundDifferences] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState([
    { name: 'Alex', score: 15420, level: 18 },
    { name: 'Jordan', score: 12800, level: 15 },
    { name: 'Sam', score: 11200, level: 14 },
    { name: 'Casey', score: 9600, level: 12 },
    { name: 'Riley', score: 8400, level: 11 }
  ]);

  // Game levels configuration
  const levels = {
    1: { type: 'Beginner', scene: 'Playground', differences: 3, timeLimit: 60, theme: 'Simple cartoon playground scene' },
    2: { type: 'Beginner', scene: 'Kitchen', differences: 4, timeLimit: 60, theme: 'Cozy kitchen interior' },
    3: { type: 'Beginner', scene: 'Beach', differences: 4, timeLimit: 60, theme: 'Sunny beach with palm trees' },
    4: { type: 'Beginner', scene: 'Garden', differences: 5, timeLimit: 60, theme: 'Colorful flower garden' },
    5: { type: 'Beginner', scene: 'Bedroom', differences: 5, timeLimit: 60, theme: 'Child\'s bedroom' },
    6: { type: 'Intermediate', scene: 'Café', differences: 6, timeLimit: 50, theme: 'Busy street café' },
    7: { type: 'Intermediate', scene: 'Market', differences: 7, timeLimit: 50, theme: 'Farmers market stall' },
    8: { type: 'Intermediate', scene: 'Library', differences: 7, timeLimit: 50, theme: 'Public library reading room' },
    9: { type: 'Intermediate', scene: 'Park', differences: 8, timeLimit: 50, theme: 'City park in autumn' },
    10: { type: 'Intermediate', scene: 'Shop', differences: 8, timeLimit: 50, theme: 'Vintage antique shop' },
    11: { type: 'Advanced', scene: 'Forest', differences: 9, timeLimit: 40, theme: 'Dense forest clearing' },
    12: { type: 'Advanced', scene: 'Office', differences: 10, timeLimit: 40, theme: 'Modern busy office' },
    13: { type: 'Advanced', scene: 'Museum', differences: 11, timeLimit: 40, theme: 'Art museum gallery' },
    14: { type: 'Advanced', scene: 'Station', differences: 11, timeLimit: 40, theme: 'Train station platform' },
    15: { type: 'Advanced', scene: 'Market', differences: 12, timeLimit: 40, theme: 'Crowded night market' },
    16: { type: 'Expert', scene: 'Abstract', differences: 13, timeLimit: 30, theme: 'Abstract geometric art' },
    17: { type: 'Expert', scene: 'Cityscape', differences: 14, timeLimit: 30, theme: 'Dense urban skyline' },
    18: { type: 'Expert', scene: 'Texture', differences: 14, timeLimit: 30, theme: 'Complex texture patterns' },
    19: { type: 'Expert', scene: 'Mandala', differences: 15, timeLimit: 30, theme: 'Intricate mandala design' },
    20: { type: 'Expert', scene: 'Fractal', differences: 15, timeLimit: 30, theme: 'Mathematical fractal art' }
  };

  // Generate procedural differences for demo
  const generateDifferences = (level: number) => {
    const config = levels[level as keyof typeof levels];
    const differences = [];
    for (let i = 0; i < config.differences; i++) {
      differences.push({
        id: i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        type: ['color', 'missing', 'added', 'size'][Math.floor(Math.random() * 4)]
      });
    }
    return differences;
  };

  const [currentDifferences, setCurrentDifferences] = useState<{ id: number; x: number; y: number; type: string }[]>([]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('showMissed');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // Start game
  const startGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name to start playing!');
      return;
    }
    setCurrentLevel(1);
    setScore(0);
    setFoundDifferences([]);
    setCurrentDifferences(generateDifferences(1));
    setTimeLeft(levels[1].timeLimit);
    setGameState('playing');
  };

  // Handle difference click
  const handleDifferenceClick = (e: React.MouseEvent<HTMLDivElement>, imageIndex: number) => {
    if (gameState !== 'playing') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is near any unfound difference
    const clickedDifference = currentDifferences.find(diff => 
      !foundDifferences.includes(diff.id) &&
      Math.abs(diff.x - x) < 20 && 
      Math.abs(diff.y - y) < 20
    );
    
    if (clickedDifference) {
      const newFound = [...foundDifferences, clickedDifference.id];
      setFoundDifferences(newFound);
      setScore(score + 100);
      
      // Check if level complete
      if (newFound.length === currentDifferences.length) {
        setScore(score + timeLeft * 10); // Bonus for remaining time
        setGameState('levelComplete');
      }
    }
  };

  // Next level
  const nextLevel = () => {
    const next = currentLevel + 1;
    if (levels[next as keyof typeof levels]) {
      setCurrentLevel(next);
      setFoundDifferences([]);
      setCurrentDifferences(generateDifferences(next));
      setTimeLeft(levels[next as keyof typeof levels].timeLimit);
      setGameState('playing');
    } else {
      // Game complete
      const finalScore = score + 1000; // Completion bonus
      setScore(finalScore);
      
      // Add to leaderboard
      const newLeaderboard = [...leaderboard, { 
        name: playerName, 
        score: finalScore, 
        level: currentLevel 
      }].sort((a, b) => b.score - a.score).slice(0, 10);
      setLeaderboard(newLeaderboard);
      
      setGameState('gameOver');
    }
  };

  // Generate cartoon playground image
  const generateImage = (level: number, isRight = false) => {
    const config = levels[level as keyof typeof levels];
    
    return (
      <div 
        className="relative w-80 h-60 border-2 border-gray-300 rounded-lg cursor-crosshair overflow-hidden bg-gradient-to-b from-blue-300 to-green-400"
        onClick={(e) => handleDifferenceClick(e, isRight ? 1 : 0)}
      >
        {/* Sky and clouds */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-300 to-blue-200">
          <div className="absolute top-2 left-8 w-12 h-8 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-4 left-16 w-8 h-6 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-3 right-12 w-10 h-6 bg-white rounded-full opacity-80"></div>
        </div>
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 w-full h-36 bg-gradient-to-b from-green-400 to-green-500"></div>
        
        {/* Sun */}
        <div className="absolute top-4 right-8 w-8 h-8 bg-yellow-400 rounded-full">
          <div className="absolute -top-2 left-3 w-0.5 h-4 bg-yellow-400"></div>
          <div className="absolute -right-2 top-3 h-0.5 w-4 bg-yellow-400"></div>
          <div className="absolute -bottom-2 left-3 w-0.5 h-4 bg-yellow-400"></div>
          <div className="absolute -left-2 top-3 h-0.5 w-4 bg-yellow-400"></div>
        </div>
        
        {/* Playground equipment */}
        {/* Swing set */}
        <div className="absolute bottom-16 left-8">
          <div className="w-1 h-16 bg-yellow-600"></div>
          <div className="absolute top-0 -right-8 w-1 h-16 bg-yellow-600"></div>
          <div className="absolute top-2 left-0 w-8 h-1 bg-yellow-600"></div>
          <div className="absolute top-6 left-2 w-0.5 h-10 bg-gray-600"></div>
          <div className="absolute bottom-0 left-1 w-3 h-2 bg-red-500 rounded"></div>
        </div>
        
        {/* Slide */}
        <div className="absolute bottom-16 right-16">
          <div className="w-12 h-8 bg-blue-500 rounded-t-lg"></div>
          <div className="w-16 h-4 bg-blue-500 transform rotate-12 origin-left mt-2"></div>
          <div className="w-2 h-12 bg-yellow-600 absolute -left-1 bottom-0"></div>
          <div className="w-2 h-12 bg-yellow-600 absolute right-1 bottom-0"></div>
        </div>
        
        {/* Seesaw */}
        <div className="absolute bottom-20 left-32">
          <div className="w-1 h-6 bg-gray-600"></div>
          <div className="absolute -top-2 -left-6 w-14 h-2 bg-orange-500 rounded transform rotate-12"></div>
          <div className="absolute -top-4 -left-8 w-4 h-4 bg-red-400 rounded-full"></div>
          <div className="absolute -top-1 right-4 w-4 h-4 bg-blue-400 rounded-full"></div>
        </div>
        
        {/* Trees */}
        <div className="absolute bottom-16 left-2">
          <div className="w-2 h-12 bg-yellow-800"></div>
          <div className="absolute -top-2 -left-3 w-8 h-8 bg-green-600 rounded-full"></div>
        </div>
        
        <div className="absolute bottom-16 right-4">
          <div className="w-2 h-10 bg-yellow-800"></div>
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-600 rounded-full"></div>
        </div>
        
        {/* Flowers */}
        <div className="absolute bottom-8 left-20 w-2 h-2 bg-pink-400 rounded-full"></div>
        <div className="absolute bottom-12 left-24 w-2 h-2 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-2 h-2 bg-red-400 rounded-full"></div>
        
        {/* Path */}
        <div className="absolute bottom-4 left-12 w-20 h-4 bg-gray-300 rounded-full opacity-60"></div>
          
          {/* Show differences if found */}
          {currentDifferences.map(diff => (
            foundDifferences.includes(diff.id) && (
              <div
                key={diff.id}
                className="absolute w-6 h-6 border-4 border-green-500 rounded-full bg-green-200 animate-pulse"
                style={{
                  left: diff.x - 12,
                  top: diff.y - 12,
                  zIndex: 10
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            )
          ))}
          
          {/* Show hint if active */}
          {showHint && currentDifferences.map(diff => (
            !foundDifferences.includes(diff.id) && (
              <div
                key={`hint-${diff.id}`}
                className="absolute w-8 h-8 border-2 border-yellow-400 rounded-full animate-ping"
                style={{
                  left: diff.x - 16,
                  top: diff.y - 16,
                  zIndex: 5
                }}
              />
            )
          ))}
          
        {/* Simulate differences on right image */}
        {isRight && currentDifferences.map(diff => {
          const diffStyle: React.CSSProperties = {
            position: 'absolute',
            left: diff.x - 5,
            top: diff.y - 5,
          };
          
          if (diff.type === 'color') {
            return <div key={`diff-${diff.id}`} className="absolute w-4 h-4 bg-red-500 rounded-full" style={diffStyle} />;
          } else if (diff.type === 'missing') {
            return <div key={`diff-${diff.id}`} className="absolute w-4 h-4 bg-white rounded-full opacity-80" style={diffStyle} />;
          } else if (diff.type === 'added') {
            return <div key={`diff-${diff.id}`} className="absolute w-3 h-3 bg-yellow-400 rounded-full" style={diffStyle} />;
          } else {
            return <div key={`diff-${diff.id}`} className="absolute w-2 h-6 bg-purple-500 rounded" style={diffStyle} />;
          }
        })}
      </div>
    );
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Eye className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Spot the Difference</h1>
            <p className="text-gray-600">Find all differences before time runs out!</p>
          </div>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
            />
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
          
          <button
            onClick={() => setGameState('leaderboard')}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>
      </div>
    );
  }

  // Leaderboard Screen
  if (gameState === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Global Leaderboard</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            {leaderboard.map((player, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-semibold">{player.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{player.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Level {player.level}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Show Missed Differences Screen
  if (gameState === 'showMissed') {
    const missedDifferences = currentDifferences.filter(diff => !foundDifferences.includes(diff.id));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center mb-6">
            <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Time's Up!</h2>
            <p className="text-gray-600 mb-4">Here are the differences you missed:</p>
            <div className="text-lg font-semibold text-red-600">
              {missedDifferences.length} difference{missedDifferences.length !== 1 ? 's' : ''} not found
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-center items-start gap-8 mb-4">
              {/* Left image with all differences highlighted */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Missed Differences</h3>
                <div 
                  className="relative w-80 h-60 border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-b from-blue-300 to-green-400"
                >
                  {/* Playground scene */}
                  {/* Sky and clouds */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-300 to-blue-200">
                    <div className="absolute top-2 left-8 w-12 h-8 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-4 left-16 w-8 h-6 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-3 right-12 w-10 h-6 bg-white rounded-full opacity-80"></div>
                  </div>
                  
                  {/* Ground */}
                  <div className="absolute bottom-0 left-0 w-full h-36 bg-gradient-to-b from-green-400 to-green-500"></div>
                  
                  {/* Sun */}
                  <div className="absolute top-4 right-8 w-8 h-8 bg-yellow-400 rounded-full">
                    <div className="absolute -top-2 left-3 w-0.5 h-4 bg-yellow-400"></div>
                    <div className="absolute -right-2 top-3 h-0.5 w-4 bg-yellow-400"></div>
                    <div className="absolute -bottom-2 left-3 w-0.5 h-4 bg-yellow-400"></div>
                    <div className="absolute -left-2 top-3 h-0.5 w-4 bg-yellow-400"></div>
                  </div>
                  
                  {/* Playground equipment */}
                  <div className="absolute bottom-16 left-8">
                    <div className="w-1 h-16 bg-yellow-600"></div>
                    <div className="absolute top-0 -right-8 w-1 h-16 bg-yellow-600"></div>
                    <div className="absolute top-2 left-0 w-8 h-1 bg-yellow-600"></div>
                    <div className="absolute top-6 left-2 w-0.5 h-10 bg-gray-600"></div>
                    <div className="absolute bottom-0 left-1 w-3 h-2 bg-red-500 rounded"></div>
                  </div>
                  
                  <div className="absolute bottom-16 right-16">
                    <div className="w-12 h-8 bg-blue-500 rounded-t-lg"></div>
                    <div className="w-16 h-4 bg-blue-500 transform rotate-12 origin-left mt-2"></div>
                    <div className="w-2 h-12 bg-yellow-600 absolute -left-1 bottom-0"></div>
                    <div className="w-2 h-12 bg-yellow-600 absolute right-1 bottom-0"></div>
                  </div>
                  
                  <div className="absolute bottom-20 left-32">
                    <div className="w-1 h-6 bg-gray-600"></div>
                    <div className="absolute -top-2 -left-6 w-14 h-2 bg-orange-500 rounded transform rotate-12"></div>
                    <div className="absolute -top-4 -left-8 w-4 h-4 bg-red-400 rounded-full"></div>
                    <div className="absolute -top-1 right-4 w-4 h-4 bg-blue-400 rounded-full"></div>
                  </div>
                  
                  <div className="absolute bottom-16 left-2">
                    <div className="w-2 h-12 bg-yellow-800"></div>
                    <div className="absolute -top-2 -left-3 w-8 h-8 bg-green-600 rounded-full"></div>
                  </div>
                  
                  <div className="absolute bottom-16 right-4">
                    <div className="w-2 h-10 bg-yellow-800"></div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-600 rounded-full"></div>
                  </div>
                  
                  <div className="absolute bottom-8 left-20 w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="absolute bottom-12 left-24 w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="absolute bottom-10 right-20 w-2 h-2 bg-red-400 rounded-full"></div>
                  
                  <div className="absolute bottom-4 left-12 w-20 h-4 bg-gray-300 rounded-full opacity-60"></div>
                  
                  {/* Highlight ONLY missed differences with pulsing red circles */}
                  {missedDifferences.map(diff => (
                    <div
                      key={`missed-${diff.id}`}
                      className="absolute w-10 h-10 border-4 border-red-500 rounded-full bg-red-200 animate-pulse"
                      style={{
                        left: diff.x - 20,
                        top: diff.y - 20,
                        zIndex: 10
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setGameState('gameOver')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors mr-4"
            >
              Continue to Results
            </button>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (gameState === 'gameOver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            {currentLevel > 15 ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                <p className="text-gray-600">You completed all levels!</p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Time's Up!</h2>
                <p className="text-gray-600">Better luck next time!</p>
              </>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{score.toLocaleString()}</div>
            <div className="text-gray-600">Final Score</div>
            <div className="text-sm text-gray-500 mt-2">Level {currentLevel} • {playerName}</div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level Complete Screen
  if (gameState === 'levelComplete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fireworks Animation */}
        {Array.from({length: 8}).map((_, i) => (
          <div
            key={`firework-${i}`}
            className="absolute"
            style={{
              left: Math.random() * 80 + 10 + '%',
              top: Math.random() * 60 + 10 + '%',
              animation: `firework ${Math.random() * 2 + 3}s ease-out infinite`,
              animationDelay: Math.random() * 4 + 's'
            }}
          >
            {/* Firework burst particles */}
            {Array.from({length: 12}).map((_, j) => (
              <div
                key={j}
                className="absolute w-1 h-6 opacity-90"
                style={{
                  background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD', '#FF9F43', '#00D2D3', '#FF69B4'][Math.floor(Math.random() * 8)],
                  transform: `rotate(${j * 30}deg)`,
                  transformOrigin: 'bottom center',
                  animation: `burst ${Math.random() * 1.5 + 2}s ease-out infinite`,
                  animationDelay: (Math.random() * 4 + i * 0.5) + 's'
                }}
              />
            ))}
            {/* Center spark */}
            <div className="absolute w-3 h-3 bg-white rounded-full animate-ping" style={{left: '-6px', top: '-6px'}} />
          </div>
        ))}
        
        {/* Rocket trails */}
        {Array.from({length: 5}).map((_, i) => (
          <div
            key={`rocket-${i}`}
            className="absolute w-1 opacity-70"
            style={{
              left: Math.random() * 90 + 5 + '%',
              height: '100px',
              background: 'linear-gradient(to top, transparent, #FFD700, #FF4500)',
              animation: `rocket ${Math.random() * 3 + 4}s linear infinite`,
              animationDelay: Math.random() * 3 + 's'
            }}
          />
        ))}
        
        {/* Confetti Animation */}
        {Array.from({length: 50}).map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 2 + 's',
              animationDuration: (Math.random() * 3 + 2) + 's'
            }}
          >
            <div
              className="w-3 h-3 rotate-45"
              style={{
                background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD', '#FF9F43', '#00D2D3'][Math.floor(Math.random() * 7)],
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          </div>
        ))}
        
        {/* Falling confetti */}
        {Array.from({length: 30}).map((_, i) => (
          <div
            key={`fall-${i}`}
            className="absolute w-2 h-6 opacity-80"
            style={{
              left: Math.random() * 100 + '%',
              background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD', '#FF9F43'][Math.floor(Math.random() * 6)],
              animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
              animationDelay: Math.random() * 2 + 's',
              transform: `rotate(${Math.random() * 45 - 22.5}deg)`
            }}
          />
        ))}
        
        {/* Floating circles */}
        {Array.from({length: 20}).map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full opacity-70"
            style={{
              width: Math.random() * 20 + 10 + 'px',
              height: Math.random() * 20 + 10 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: ['#FFD93D', '#6BCF7F', '#4D96FF', '#FF6B9D', '#C44569', '#F8B500'][Math.floor(Math.random() * 6)],
              animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}
        
        <style jsx>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-20px) scale(1.1);
            }
          }
          
          @keyframes firework {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            50% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          
          @keyframes burst {
            0% {
              transform: scaleY(0);
              opacity: 1;
            }
            50% {
              transform: scaleY(1);
              opacity: 1;
            }
            100% {
              transform: scaleY(0.3);
              opacity: 0;
            }
          }
          
          @keyframes rocket {
            0% {
              bottom: 0%;
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            80% {
              opacity: 1;
            }
            100% {
              bottom: 100%;
              opacity: 0;
            }
          }
        `}</style>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
          <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-4xl font-bold text-green-600 mb-4 animate-pulse">Well Done!</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Level Complete!</h3>
          <p className="text-gray-600 mb-6">Great job finding all the differences!</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-2xl font-bold text-green-600 mb-2">{score.toLocaleString()}</div>
            <div className="text-gray-600">Current Score</div>
            <div className="text-sm text-gray-500 mt-2">
              Level {currentLevel} • Time Bonus: {timeLeft * 10}
            </div>
          </div>
          
          <button
            onClick={nextLevel}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Next Level
          </button>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-purple-600">Level {currentLevel}</div>
            <div className="text-gray-600">{levels[currentLevel as keyof typeof levels]?.type}</div>
            <div className="text-sm text-gray-500">{levels[currentLevel as keyof typeof levels]?.theme}</div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                {timeLeft}s
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-700">{score.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-700">
                {foundDifferences.length}/{currentDifferences.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center items-start gap-8 mb-4">
            {generateImage(currentLevel, false)}
            {generateImage(currentLevel, true)}
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setShowHint(true);
                setTimeout(() => setShowHint(false), 3000);
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Hint (3s)
            </button>
            
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <span className="text-2xl font-bold">
                {currentDifferences.length - foundDifferences.length}
              </span>
              <span className="text-sm">
                left to find
              </span>
            </div>
            
            <button
              onClick={() => setGameState('menu')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Quit Game
            </button>
          </div>
          
          <div className="text-center text-gray-600 mt-4">
            Click on the differences you find in either image!
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotTheDifferenceGame;