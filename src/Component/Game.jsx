import React, { useState, useEffect } from 'react';

const generateSecretNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const MAX_ATTEMPTS = 20;

const Game = () => {
  const [secretNumber, setSecretNumber] = useState(generateSecretNumber());
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [bonusHint, setBonusHint] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning, startTime]);

  const giveHint = (attempts) => {
    const digits = secretNumber.split('').map(Number);
    let hint = '';

    const easyHints = [
      `Square of ${digits[0]}?`,
      `Add ${digits[1]} + ${digits[2]}`,
      `Which number cubed is ${digits[3] ** 3}?`,
      `What is ${digits[0]} × ${digits[1]}?`,
    ];

    const mediumHints = [
      `∫ dx for f(x) = ${digits[1]}x → ? + C`,
      `d/dx of f(x) = ${digits[0]}x → ?`,
      `What is √${digits[1] ** 2}?`,
      `One digit is between ${Math.min(...digits)} and ${Math.max(...digits)}`,
      `Digits 2+3 add up to ${digits[1] + digits[2]}`,
    ];

    const hardHints = [
      `If x = ${digits[0]}, what is x² + 2x?`,
      `You eat ${digits[3]} apples/day for ${digits[0]} days. How many apples?`,
      `What number ÷ ${digits[3]} = ${(digits[2] / digits[3]).toFixed(2)}?`,
      `If f(x) = x³, what’s f(${digits[0]})?`,
      `∫${digits[2]}x² dx = ?`,
      `a = ${digits[0]}, b = ${digits[1]} → a² + b² = ?`,
    ];

    const combinedHints = {
      Easy: easyHints,
      Medium: [...easyHints, ...mediumHints],
      Hard: [...easyHints, ...mediumHints, ...hardHints],
    };

    const hintArray = combinedHints[difficulty];
    if (attempts <= hintArray.length) {
      hint = hintArray[attempts - 1];
    }

    if (hint) setBonusHint(`🧠 Hint: ${hint}`);
  };

  const handleGuess = (value) => {
    if (!startTime) {
      setStartTime(Date.now());
      setTimerRunning(true);
    }

    if (value.length !== 4 || isNaN(value)) {
      setMessage("⚠️ Enter a valid 4-digit number.");
      return;
    }

    const newGuesses = [...guesses, value];
    setGuesses(newGuesses);

    if (value === secretNumber) {
      setMessage("✅ Correct guess! 🎉");
      setBonusHint('');
      setShowAnswer(true);
      setTimerRunning(false);
    } else if (value.split('').sort().join('') === secretNumber.split('').sort().join('')) {
      setMessage("🔁 Same digits, wrong order!");
    } else if (parseInt(value) > parseInt(secretNumber)) {
      setMessage("🔽 Try a lower number.");
    } else if (parseInt(value) < parseInt(secretNumber)) {
      setMessage("🔼 Try a higher number.");
    } else {
      setMessage("❌ No matching digits.");
    }

    setGuess('');

    giveHint(newGuesses.length);

    if (newGuesses.length >= MAX_ATTEMPTS && value !== secretNumber) {
      setShowAnswer(true);
      setTimerRunning(false);
      setMessage("⛔ Attempts exhausted!");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setGuess(value);
      if (value.length === 4 && guesses.length < MAX_ATTEMPTS && !showAnswer) {
        handleGuess(value);
      }
    }
  };

  const restartGame = () => {
    setSecretNumber(generateSecretNumber());
    setGuesses([]);
    setMessage('');
    setBonusHint('');
    setGuess('');
    setShowAnswer(false);
    setStartTime(null);
    setElapsedTime(0);
    setTimerRunning(false);
    setDifficulty(null);
  };

  if (!difficulty) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-xl rounded-2xl text-center space-y-4">
        <h1 className="text-2xl font-bold text-indigo-600">🎯 Select Difficulty</h1>
        <div className="flex flex-col gap-3">
          <button onClick={() => setDifficulty('Easy')} className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600">
            🟢 Easy
          </button>
          <button onClick={() => setDifficulty('Medium')} className="py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
            🟡 Medium
          </button>
          <button onClick={() => setDifficulty('Hard')} className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">
            🔴 Hard
          </button>
        </div>
      </div>
    );
  }

  const attemptsLeft = MAX_ATTEMPTS - guesses.length;

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-xl rounded-2xl text-center space-y-4">
      <h1 className="text-2xl font-bold text-indigo-600">🔢 4-Digit Guessing Game ({difficulty})</h1>

      <input
        type="text"
        value={guess}
        maxLength={4}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border rounded-lg text-center text-lg"
        placeholder="Enter 4-digit number"
        disabled={guesses.length >= MAX_ATTEMPTS || showAnswer}
      />

      <div className="text-sm text-gray-500">🔄 Attempts Left: {attemptsLeft}</div>
      {timerRunning || showAnswer ? (
        <div className="text-sm text-gray-500">⏱️ Time Elapsed: {elapsedTime} sec</div>
      ) : null}

      {message && <div className="text-lg font-medium text-gray-700">{message}</div>}
      {bonusHint && <div className="text-md font-medium text-amber-600 mt-2">{bonusHint}</div>}

      {guesses.length > 0 && (
        <div className="text-left mt-4">
          <h2 className="font-semibold mb-2">Your Guesses:</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-800">
            {guesses.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {showAnswer && (
        <div className="mt-4 text-green-700 text-lg font-semibold">
          🎯 The correct number was: <span className="underline">{secretNumber}</span>
          <div className="text-sm text-slate-600 mt-1">🏁 Your time: {elapsedTime} sec</div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={() => setShowAnswer(true)}
          className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Correct Answer
        </button>

        <button
          onClick={restartGame}
          className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default Game;
