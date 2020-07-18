import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { retrieveUser, storeUser } from './store-user';
import Nav from './Nav';
import { Routes } from './Routes';
import Title from './Title';

export default function App() {
  const [user, setUser] = useState(retrieveUser());

  function su(u) {
    setUser(u);
    storeUser(u);
  }

  return (
    <Router>
      <div className="container">
        <Title />
        <Nav user={user} setUser={su} />
        <Routes user={user} setUser={su} />
      </div>
    </Router>
  );
}
