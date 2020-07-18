import React from 'react';
import { Link } from 'react-router-dom';
import { SignedInAs } from './UserManagement';

export default function Nav({ user, setUser }) {
  if (user) {
    return (
      <div className="row">
        <div className="col-sm-12">
          <SignedInAs user={user} />
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="btn btn-dark" to="/draft">
                    Create or Edit a Game
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-dark" to="/host">
                    Host a Game
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-dark" to="/play">
                    Play a Game
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-dark"
                    onClick={() => setUser(null)}
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    );
  }
  return '';
}
