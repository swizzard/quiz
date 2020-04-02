import React, { useState } from 'react';
import SignIn from './SignIn';
import DashboardPicker from './Dashboard';

function App() {
  const [user, setUser] = useState(null);
  return user ? <DashboardPicker user={user} /> : <SignIn setUser={setUser} />;
}

export default App;
