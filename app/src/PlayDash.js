import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import PlayerGame from './PlayerGame';

export default function PlayDash({ user }) {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route path={`${match.path}/:gameCode`}>
        <PlayerGame user={user} />
      </Route>
    </Switch>
  );
}
