import { useState, useEffect } from "react";
import axios from "axios";

const Game = () => {
  const [sessionId, setSessionId] = useState(null);
  const [lyricsHint, setLyricsHint] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [userGuess, setUserGuess] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(10); // 10-second timer

  // Start game when component mounts
  useEffect(() => {
    startGame();
  }, []);

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

      if (response.data.correct) {
        setMessage("🎉 Correct! You guessed the song!");
      } else {
        setGuessesLeft((prev) => prev - 1);
        setLyricsHint(response.data.newLyricsHint);
        setMessage("❌ Wrong guess! More lyrics revealed...");
      }

      setTimer(10); // Reset timer for next round
    } catch (error) {
      console.error("Error submitting guess:", error);
    }
  };

  // Timer countdown logic
  useEffect(() => {
    if (guessesLeft > 0 && sessionId) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setGuessesLeft((prev) => prev - 1); // Reduce guesses
            setMessage("⏳ Time ran out! More lyrics revealed...");
            setTimer(10); // Reset timer
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      // Stop the countdown if guesses are over or a message is shown
      setTimer(10);
    }
  }, [sessionId, guessesLeft]); // Ensures the timer runs only when the game is active

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
