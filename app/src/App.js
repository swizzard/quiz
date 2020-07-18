import { React, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SignedInAs } from './UserManagement';
import { retrieveUser, storeUser } from './store-user';
import Nav from './Nav';
import { Routes } from './Routes';

export default function App() {
  const [user, setUser] = useState(retrieveUser());

  function su(u) {
    setUser(u);
    storeUser(u);
  }

  return (
    <Router>
      <div className="container">
        <SignedInAs user={user} />
        <Nav />
        <Routes user={user} setUser={su} />
      </div>
    </Router>
  );
}
