import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import HostGame from './HostGame';
import { getHostGames } from './db/game';
import HostGameSummary from './HostGameSummary';

export default function HostDash({ user }) {
  const [error, setError] = useState(null);
  const [games, setGames] = useState(null);
  const match = useRouteMatch();

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

  return (
    <Switch>
      <Route path={`${match.path}/:gameId`}>
        <HostGame user={user} />
      </Route>
      <Route path={`${match.path}`}>
        <Dash error={error} games={games} match={match} user={user} />
      </Route>
    </Switch>
  );
}

function Dash({ error, games, user }) {
  return (
    <>
      {error ? (
        <div className="row">
          <div className="bg-error">{error}</div>
        </div>
      ) : null}
      {games && games.length > 0 ? (
        games.map((g, ix) => (
          <HostGameSummary
            quiz={g}
            selectLabel="Host Game"
            remove={null}
            key={`${user.id}-game-${ix}`}
            urlPath=""
          />
        ))
      ) : (
        <h4>No Games</h4>
      )}
    </>
  );
}
