import React from 'react';
import { Switch, Redirect, Route, useLocation } from 'react-router-dom';

import { About, Help } from './About';
import DraftDash from './DraftDash';
import HostDash from './HostDash';
import PlayDash from './PlayDash';
import SignIn from './SignIn';

export function AuthRedirect() {
  const loc = useLocation();
  return <Redirect to={{ pathname: '/', state: { from: loc } }} />;
}

function LoggedInRoute({ children, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        user ? (
          children
        ) : (
          <Redirect to={{ pathname: '/', state: { from: location } }} />
        )
      }
    />
  );
}

export function Routes({ user, setUser }) {
  return (
    <Switch>
      <LoggedInRoute user={user} path="/draft">
        <DraftDash user={user} setUser={setUser} />
      </LoggedInRoute>
      <LoggedInRoute user={user} path="/host">
        <HostDash user={user} setUser={setUser} />
      </LoggedInRoute>
      <LoggedInRoute user={user} path="/play">
        <PlayDash user={user} setUser={setUser} />
      </LoggedInRoute>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/help">
        <Help />
      </Route>
      <Route path="/">
        <SignIn user={user} setUser={setUser} />
      </Route>
    </Switch>
  );
}
