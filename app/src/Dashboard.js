import React, { useState } from 'react';

import DraftDash from './DraftDash';
import HostDash from './HostDash';
import PlayDash from './PlayDash';

const PLAY = 'play';
const HOST = 'host';
const DRAFT = 'draft';

export default function DashboardPicker({ user }) {
  const [dashState, setDashState] = useState(null);

  function radioChange(e) {
    setDashState(e.target.value);
  }

  function displayDash() {
    switch (dashState) {
      case PLAY:
        return <PlayDash user={user} setDashState={setDashState} />;
      case HOST:
        return <HostDash user={user} setDashState={setDashState} />;
      case DRAFT:
        return <DraftDash user={user} setDashState={setDashState} />;
      default:
        return null;
    }
  }

  return (
    <div>
      <div>
        <p>Signed in as {user.display_name}</p>
      </div>
      <div>
        <label>Play a Game</label>
        <input
          type="radio"
          name="stateSelector"
          value={PLAY}
          checked={dashState === PLAY}
          onChange={radioChange}
        />
        <label>Host a Game</label>
        <input
          type="radio"
          name="stateSelector"
          value={HOST}
          checked={dashState === HOST}
          onChange={radioChange}
        />
        <label>Draft a Game</label>
        <input
          type="radio"
          name="stateSelector"
          value={DRAFT}
          checked={dashState === DRAFT}
          onChange={radioChange}
        />
      </div>
      {displayDash()}
    </div>
  );
}
