import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { getIp, newUser } from './db/user';

export default function SignIn({ user, setUser }) {
  const [ip, setIp] = useState('');
  const [signIn, setSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => getIp(setIp, setError), [ip]);

  const { from } = location.state || { from: { pathname: '/' } };

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

  if (user) {
    return '';
  }
  return (
    <div className="container">
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
              onClick={() => {
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
              <div className="col-sm-9">
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
                signIn
                  ? doSignIn(
                      email,
                      password,
                      ip,
                      setError,
                      setUser,
                      history,
                      from,
                      valForm
                    )
                  : doSignUp(
                      email,
                      password,
                      displayName,
                      ip,
                      setError,
                      setUser,
                      history,
                      from,
                      valForm
                    );
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
              type="button"
              onClick={() => {
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

function doSignIn(
  email,
  password,
  ip,
  setError,
  setUser,
  history,
  from,
  valForm
) {
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
          history.replace(from);
        } else {
          setError('Invalid email/password');
        }
      })
      .catch((e) => setError(e.message));
  }
}

function doSignUp(
  email,
  password,
  displayName,
  ip,
  setError,
  setUser,
  history,
  from,
  valForm
) {
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
          history.replace(from);
        } else {
          setError('There was an error creating your account');
        }
      })
      .catch((e) => setError(e.message));
  }
}
