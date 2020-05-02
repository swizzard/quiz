import React, { useEffect, useState } from 'react';
import DraftGame from './DraftGame';
import { deleteGame, getHostGames } from './db/game';
import HostGameSummary from './HostGameSummary';

function newGame({ display_name, id }) {
  return {
    name: '',
    creator: {
      display_name,
      id,
    },
    quizRounds: [],
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
        } else if (resp.status === 406) {
          return { games: [] };
        } else {
          throw new Error('There was a problem retrieving your games.');
        }
      })
      .then((games) => {
        debugger;
        setGames(
          games.map(({ name, quizRounds }) => {
            return {
              name,
              quizRounds: quizRounds.map(({ questions }) => questions),
            };
          }),
        );
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [user.id]);

  function removeGame(id) {
    return () => {
      deleteGame(user.id, id)
        .then(() => {
          setGames(games.filter((g) => g.id !== id));
        })
        .catch(() => setError('There was a problem deleting your game'));
    };
  }
  if (selectedGame) {
    return (
      <DraftGame
        game={selectedGame}
        user={user}
        goBack={() => setSelectedGame(null)}
      />
    );
  } else {
    return (
      <div>
        {error ? <div>{error}</div> : null}
        <div>
          {games && games.length > 0 ? (
            games.map((g, ix) => (
              <HostGameSummary
                quiz={g}
                select={setSelectedGame}
                selectLabel="Edit Game"
                remove={removeGame(g.id)}
                key={`${user.id}-game-${ix}`}
              />
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
}
