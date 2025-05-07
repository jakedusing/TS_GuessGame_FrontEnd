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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white font-sans p-6">
      <h1 className="text-4xl font-semibold mb-6 text-indigo-100 tracking-wide drop-shadow-sm">
        Lyric Guess Game
      </h1>

      {guessesLeft > 0 ? (
        <>
          <div className="bg-indigo-800/30 border border-indigo-400/50 p-5 rounded-lg shadow-md w-full max-w-full">
            <p className="text-xl italic text-center text-indigo-100 mb-4">
              "{lyricsHint}"
            </p>

            <p className="text-sm text-indigo-300 mb-2 text-center">
              Time left: <span className="font-bold">{timer}s</span>
            </p>

            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="Name the song..."
              className="w-full p-3 rounded-md bg-indigo-100 text-indigo-900 placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
            />

            <button
              onClick={() => handleGuess(userGuess)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition duration-300 shadow-sm"
            >
              Submit GUess
            </button>

            <div className="mt-4 text-center">
              <p className="text-indigo-200">Guesses left: {guessesLeft}</p>
              {message && (
                <p className="mt-2 text-indigo-100 font-medium">{message}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-2xl text-rose-400 mt-10 font-semibold drop-shadow">
          Game Over! Try Again.
        </p>
      )}
    </div>
  );
};

export default Game;
