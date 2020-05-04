import React, { useState } from "react";
import PlayerGame from "./PlayerGame";
import { joinGame } from "./db/game";

export default function PlayDash({ setDashState, user }) {
  const [participantId, setParticipantId] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  function loadGame() {
    if (gameCode) {
      joinGame(user.id, gameCode)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error("There was an error loading your game");
          }
        })
        .then(([{ participantId: pId, game }]) => {
          setGame(game.quiz);
          setParticipantId(pId);
        })
        .catch((e) => setError(e.message));
    } else {
      setError("Missing game code");
    }
  }

  return game ? (
    <PlayerGame game={game} key={`${gameCode}-${participantId}`} participantId={participantId} />
  ) : (
    <div>
      {error ? <div>{error}</div> : null}
      <form>
        <div>
          <label>Game Code</label>
          <input
            type="text"
            onChange={(e) => {
              setError(null);
              setGameCode(e.target.value);
            }}
          />
        </div>
        <div>
          <button type="button" onClick={() => loadGame()}>
            Play
          </button>
        </div>
      </form>
      <div>
        <button type="button" onClick={() => setDashState(null)}>
          Back
        </button>
      </div>
    </div>
  );
}
