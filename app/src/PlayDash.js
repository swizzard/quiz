import React, { useState } from 'react';
import PlayerGame from './PlayerGame';
import { getGame } from './db/game';

export default function PlayDash({ setDashState, user }) {
  const [gameCode, setGameCode] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  function loadGame() {
    if (gameCode) {
      getGame(user.id, gameCode)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error('There was an error loading your game');
          }
        })
        .then((jsn) => setGame(jsn))
        .catch((e) => setError(e.message));
    } else {
      setError('Missing game code');
    }
  }

  return game ? (
    <PlayerGame game={game} user={user} />
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
