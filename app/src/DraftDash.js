import React, { useEffect, useState } from 'react';
import DraftGame from './DraftGame';
import { deleteGame, getHostGames } from './db/game';
import HostGameSummary from './HostGameSummary';
import { filterOutBy } from './utils';

function newGame({ display_name, id }) {
  return {
    name: '',
    creator: {
      display_name,
      id
    },
    quizRounds: []
  };
}

export default function DraftDash({ setDashState, user }) {
  const [error, setError] = useState(null);
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  function getGames() {
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
        setGames(games);
      })
      .catch((e) => {
        setError(e.message);
      });
  }

  useEffect(getGames, [user.id]);

  function removeGame(id) {
    return () => {
      deleteGame(user.id, id)
        .then((v) => {
          setGames(filterOutBy(games, ({ id: gameId }) => gameId === v[0].id));
        })
        .catch(() => {
          setError('There was a problem deleting your game');
        });
    };
  }

  function back() {
    setSelectedGame();
    getGames();
  }

  if (selectedGame) {
    return <DraftGame game={selectedGame} user={user} goBack={back} />;
  } else {
    return (
      <>
        {error ? (
          <div className="row">
            <div className="bg-error">{error}</div>
          </div>
        ) : null}
        <>
          {games && games.length > 0 ? (
            games.map((g, ix) => (
              <HostGameSummary
                quiz={g}
                select={setSelectedGame}
                selectLabel="Edit Game"
                remove={removeGame(g.quizId)}
                key={`${user.id}-game-${ix}`}
              />
            ))
          ) : (
            <h4>No Games</h4>
          )}
        </>
        <div className="row" style={{ marginTop: 10 }}>
          <div className="col-sm-12">
            <div className="btn-group">
              <button
                className="btn btn-dark"
                onClick={() => setSelectedGame(newGame(user))}
              >
                Create Game
              </button>
              <button
                className="btn btn-dark"
                onClick={() => setDashState(null)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
