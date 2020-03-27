import React, { useEffect, useState } from 'react';
import DraftGame from './DraftGame';
import { getHostGames } from './db/games';
import HostGameSummary from './HostGameSummary';

function newGame({ display_name, id }) {
  return {
    name: '',
    creator: {
      display_name,
      id,
    },
    quiz_rounds: [],
  };
}

export default function DraftDash({ setDashState, user }) {
  const [error, setError] = useState(null);
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    getHostGames(user.id)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error('There was a problem retrieving your games.');
        }
      })
      .then((games) => setGames(games))
      .catch((e) => setError(e));
  }, [games]);

  return selectedGame ? (
    <DraftGame game={selectedGame} user={user} />
  ) : (
    <div>
      {error ? <div>{error}</div> : null}
      <div>
        {games.length > 0 ? (
          games.map((g) => (
            <HostGameSummary game={g} select={setSelectedGame} user={user} />
          ))
        ) : (
          <h4>No Games</h4>
        )}
      </div>
      <div>
        <button onClick={() => setSelectedGame(newGame(user))}>
          Create Game
        </button>
      </div>
      <div>
        <button onClick={() => setDashState(null)}>Back</button>
      </div>
    </div>
  );
}
