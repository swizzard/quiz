import React from 'react';

export function SignedInAs(user) {
  if (user) {
    return (
      <div className="row">
        <div className="col-sm-12">
          <p>Signed in as {user.display_name}</p>
        </div>
      </div>
    );
  }
  return '';
}

export function SignOut(setUser) {
  return (
    <div className="row">
      <div className="col-sm-12 button-row">
        <button
          className="btn btn-dark btn-sm"
          type="button"
          onClick={() => setUser(null)}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
