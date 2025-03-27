import { useState, useEffect } from "react";
import axios from "axios";

const Game = () => {
  const [sessionId, setSessionId] = useState(null);
  const [lyricsHint, setLyricsHint] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [userGuess, setUserGuess] = useState("");
  const [messsage, setMessage] = useState("");
  const [timer, setTimer] = useState(10); // 10 second timer

  useEffect(() => {
    startGame();
  }, []);

  const startGame = async () => {
    try {
      const response = await axios.post("http://localhost:5028/api/game/start");
      setSessionId(response.data.sessionId);
      setLyricsHint(response.data.lyricsHint);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };
};
