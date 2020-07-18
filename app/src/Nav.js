import React from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <div className="row">
      <div className="col-sm-12">
        <nav className="navbar navbar-expand-lg">
          <ul className="navbar-nav">
            <li>
              <Link to="/draft">Create or Edit a Game</Link>
            </li>
            <li>
              <Link to="/host">Host a Game</Link>
            </li>
            <li>
              <Link to="/play">Play a Game</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
