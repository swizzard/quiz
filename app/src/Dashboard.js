import React, { useState } from 'react';

import DraftDash from './DraftDash';
import HostDash from './HostDash';
import PlayDash from './PlayDash';
import { retrieveDashState, storeDashState } from './store-user';

const PLAY = 'play';
const HOST = 'host';
const DRAFT = 'draft';

export default function DashboardPicker({ signOut, user }) {
  const [dashState, setDashState] = useState(retrieveDashState());

  function setState(st) {
    storeDashState(st);
    setDashState(st);
  }

  function radioChange(e) {
    setState(e.target.value);
  }

  function displayDash() {
    switch (dashState) {
      case PLAY:
        return <PlayDash user={user} setDashState={setState} />;
      case HOST:
        return <HostDash user={user} setDashState={setState} />;
      case DRAFT:
        return <DraftDash user={user} setDashState={setState} />;
      default:
        return null;
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          <p>Signed in as {user.display_name}</p>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="stateSelector"
              value={PLAY}
              checked={dashState === PLAY}
              onChange={radioChange}
            />
            <label className="form-check-label">Play a Game</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="stateSelector"
              value={HOST}
              checked={dashState === HOST}
              onChange={radioChange}
            />
            <label className="form-check-label">Host a Game</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="stateSelector"
              value={DRAFT}
              checked={dashState === DRAFT}
              onChange={radioChange}
            />
            <label className="form-check-label">Create or Edit a Game</label>
          </div>
        </div>
      </div>
      {displayDash()}
      <div className="row">
        <div className="col-sm-12 button-row">
          <button
            className="btn btn-dark btn-sm"
            type="button"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
