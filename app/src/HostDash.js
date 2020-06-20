import React, { useEffect, useState } from 'react';
import HostGame from './HostGame';
import { deleteGame, getHostGames } from './db/game';
import HostGameSummary from './HostGameSummary';

export default function HostDash({ setDashState, user }) {
  const [error, setError] = useState(null);
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    getHostGames(user.id)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error('There was a problem retrieving your games');
        }
      })
      .then((games) => setGames(games))
      .catch((e) => setError(e.message));
  }, [user.id]);

  function removeGame({ id }) {
    return () => {
      deleteGame(user.id, id)
        .then(() => {
          setGames(games.filter((g) => g.id !== id));
        })
        .catch(() => setError('There was a problem deleting your game'));
    };
  }
  return selectedGame ? (
    <HostGame game={selectedGame} user={user} />
  ) : (
    <>
      {error ? (
        <div className="row">
          <div className="col-sm-12 bg-error">{error}</div>
        </div>
      ) : null}
      <>
        {games ? (
          games.map((g) => (
            <HostGameSummary
              key={`${g.quizId}`}
              quiz={g}
              select={setSelectedGame}
              remove={removeGame(g.quizId)}
              selectLabel="Host Game"
            />
          ))
        ) : (
          <h4>No Games</h4>
        )}
      </>
      <div className="row">
        <div className="col-sm-12 button-row">
          <button
            className="btn btn-dark btn-sm"
            onClick={() => setDashState(null)}
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}
