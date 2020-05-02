import React, { useState } from 'react';
import SignIn from './SignIn';
import DashboardPicker from './Dashboard';
import { retrieveUser, storeUser } from './store-user';

function App() {
  const [user, setUser] = useState(retrieveUser());

  function su(u) {
    storeUser(u);
    setUser(u);
  }
  return user ? <DashboardPicker user={user} /> : <SignIn setUser={su} />;
}

export default App;
