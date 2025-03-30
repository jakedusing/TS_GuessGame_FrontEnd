import { useState, useEffect } from "react";
import axios from "axios";

const Game = () => {
  const [sessionId, setSessionId] = useState(null);
  const [lyricsHint, setLyricsHint] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [userGuess, setUserGuess] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(10); // 10-second timer
  const [timerInterval, setTimerInterval] = useState(null);

  // Start game when component mounts
  useEffect(() => {
    if (!sessionId) {
      startGame();
    }
  }, [sessionId]);

  const startGame = async () => {
    try {
      const response = await axios.get("http://localhost:5028/api/game/start");
      setSessionId(response.data.sessionId);
      setLyricsHint(response.data.hint);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleGuess = async (guess) => {
    if (!sessionId || guessesLeft <= 0) return; // Ensure sessionId is set before guessing

    try {
      const response = await axios.post(
        "http://localhost:5028/api/game/guess",
        {
          sessionId,
          guess,
        }
      );

      console.log("Backend response:", response.data);

      if (response.data.correct) {
        setMessage("🎉 Correct! You guessed the song!");
        clearInterval(timerInterval);
        setTimer(10);
        return;
      }

      setGuessesLeft((prev) => prev - 1);

      if (response.data.hint !== undefined && response.data.hint !== "") {
        setLyricsHint(response.data.hint);
      } else {
        console.warn("No new lyrics hint received");
      }

      setMessage("Wrong guess! More lyrics revealed...");
      setTimer(10);
    } catch (error) {
      console.error("Error submitting guess:", error);
    }
  };

  // Timer countdown logic
  useEffect(() => {
    if (guessesLeft <= 0 || timer === null) return;

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          handleGuess("");
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(countdown);
    return () => clearInterval(countdown);
  }, [guessesLeft, sessionId]); // Ensures the timer runs only when the game is active

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-3xl font-bold mb-5">🎶 Taylor Swift Guess Game</h1>

      {guessesLeft > 0 ? (
        <>
          <p className="text-lg italic text-center bg-gray-800 p-3 rounded">
            "{lyricsHint}"
          </p>
          <p className="mt-3 text-red-300">⏳ Time left: {timer}s</p>
          <input
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Enter song name..."
            className="mt-4 p-2 rounded text-black"
          />
          <button
            onClick={() => handleGuess(userGuess)}
            className="mt-3 px-4 py-2 bg-blue-500 rounded hover:bg-blue-700"
          >
            Submit Guess
          </button>
          <p className="mt-3 text-yellow-300">❤️ Guesses left: {guessesLeft}</p>
          {message && <p className="mt-2">{message}</p>}
        </>
      ) : (
        <p className="text-2xl text-red-500">Game Over! Try Again.</p>
      )}
    </div>
  );
};

export default Game;
