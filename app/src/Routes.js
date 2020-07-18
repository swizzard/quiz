import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import DraftDash from './DraftDash';
import HostDash from './HostDash';
import PlayDash from './PlayDash';
import SignIn from './SignIn';
import authenticate from './authenticate';

function SignInRoute({ setUser }) {
  return (
    <Route path="/">
      <SignIn setUser={setUser} />
    </Route>
  );
}

export function PrivateRoute({ children, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (authenticate(user)) {
          return children;
        } else {
          return <Redirect to={{ pathname: '/', state: { from: location } }} />;
        }
      }}
    />
  );
}

export function Routes({ user, setUser }) {
  return (
    <Switch>
      <SignInRoute setUser={setUser} />
      <PrivateRoute path="/draft" user={user}>
        <DraftDash user={user} setUser={setUser} />
      </PrivateRoute>
      <PrivateRoute path="/host" user={user}>
        <HostDash user={user} setUser={setUser} />
      </PrivateRoute>
      <PrivateRoute path="/play" user={user}>
        <PlayDash user={user} setUser={setUser} />
      </PrivateRoute>
    </Switch>
  );
}
