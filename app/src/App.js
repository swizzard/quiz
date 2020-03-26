import React, { useState } from 'react';
import SignIn from './SignIn';

function App() {
  const [user, setUser] = useState(null);
  if (user) {
    return (
      <div>
        <p>{user.email}</p>
        <p>{user.display_name}</p>
      </div>
    );
  } else {
    return <SignIn setUser={setUser} />;
  }
}

export default App;
