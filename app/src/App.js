import React, { useState } from "react";
import SignIn from "./SignIn";
import DashboardPicker from "./Dashboard";
import { retrieveUser, storeUser } from "./store-user";

function App() {
  const [user, setUser] = useState(retrieveUser());

  function su(u) {
    storeUser(u);
    setUser(u);
  }
  function signOut() {
    storeUser(null);
    setUser(null);
  }

  return user ? <DashboardPicker user={user} signOut={signOut} /> : <SignIn setUser={su} />;
}

export default App;
