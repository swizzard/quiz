import React, { useEffect, useState } from 'react';

import { getIp, newUser } from './db/user';

export default function SignIn({ setUser }) {
  const [ip, setIp] = useState('');
  const [signIn, setSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => getIp(setIp, setError), [ip]);

  function valForm() {
    setError(null);
    if (!email) {
      setError('Email missing');
      return false;
    }
    if (!password) {
      setError('Password missing');
      return false;
    }
    if (!signIn) {
      if (!confPassword) {
        setError('Please confirm password');
        return false;
      }
      if (!displayName) {
        setError('Display name missing');
        return false;
      }
    }
    return true;
  }

  function doSignIn() {
    if (valForm()) {
      newUser(email, password, '', ip)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error('Error signing in');
          }
        })
        .then(([user]) => {
          if (user && user.id !== -1) {
            setUser(user);
          } else {
            setError('Invalid email/password');
          }
        })
        .catch((e) => setError(e.message));
    }
  }

  function doSignUp() {
    if (valForm()) {
      newUser(email, password, displayName, ip)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error('There was an error creating your account');
          }
        })
        .then((jsn) => {
          let user = jsn[0];
          if (user && user.id !== -1) {
            setUser(user);
          } else {
            setError('There was an error creating your account');
          }
        })
        .catch((e) => setError(e.message));
    }
  }
  return (
    <div class="container">
      {error ? (
        <div className="row">
          <div className="bg-danger">{error}</div>
        </div>
      ) : null}
      <form>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Email</label>
          <div className="col-sm-9">
            <input
              type="text"
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Password</label>
          <div className="col-sm-6">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="col-sm-3">
            <button
              type="button"
              className="btn btn-dark btn-sm"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? 'Hide' : 'Show'} Password
            </button>
          </div>
        </div>
        {signIn ? null : (
          <>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">
                Confirm Password
              </label>
              <div class="col-sm-9">
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => setConfPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Display Name</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  type="text"
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        <div className="form-group row">
          <div className="col-sm-12">
            <button
              className="btn btn-dark"
              type="button"
              onClick={() => {
                signIn ? doSignIn() : doSignUp();
              }}
            >
              {signIn ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-12">
            <button
              className="btn btn-dark btn-sm"
              onClick={(e) => {
                e.preventDefault();
                setSignIn(!signIn);
              }}
            >
              Sign {signIn ? 'Up' : 'In'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
