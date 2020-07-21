import React, { useEffect, useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import DraftGame from './DraftGame';
import { deleteGame, getHostGames } from './db/game';
import HostGameSummary from './HostGameSummary';

export default function DraftDash({ user }) {
  const [error, setError] = useState(null);
  const [games, setGames] = useState(null);
  const [update, setUpdate] = useState(0);
  const match = useRouteMatch('/draft');

  function forceUpdate() {
    setUpdate(update + 1);
  }

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

  useEffect(getGames, [user.id, update]);

  function removeGame(id) {
    return () => {
      deleteGame(user.id, id)
        .then(() => {
          forceUpdate();
        })
        .catch(() => {
          setError('There was a problem deleting your game');
        });
    };
  }
  return (
    <Switch>
      <Route path={`${match.path}/edit/:gameId`}>
        <DraftGame user={user} forceUpdate={forceUpdate} />
      </Route>
      <Route path={`${match.path}/new`}>
        <DraftGame user={user} forceUpdate={forceUpdate} />
      </Route>
      <Route path={`${match.path}`}>
        <Dash
          error={error}
          games={games}
          match={match}
          removeGame={removeGame}
          user={user}
        />
      </Route>
    </Switch>
  );
}

function Dash({ error, games, match, removeGame, user }) {
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
              selectLabel="Edit Game"
              remove={removeGame(g.quizId)}
              key={`${user.id}-game-${ix}`}
              urlPath="edit"
            />
          ))
        ) : (
          <h4>No Games</h4>
        )}
      </>
      <div className="row create-game-row">
        <div className="col-sm-12">
          <div className="btn-group">
            <Link className="btn btn-dark" to={`${match.path}/new`}>
              Create Game
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
