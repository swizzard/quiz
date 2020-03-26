import React, { useEffect, useState } from 'react';

import { getIp, newUser } from './db/user';

function SignIn({ setUser }) {
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
    console.log('try doSignIn');
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
        .catch((e) => setError(e));
    }
  }

  function doSignUp() {
    console.log('try doSignUp');
    if (valForm()) {
      console.log('doSignUp');
      newUser(email, password, displayName, ip)
        .then((resp) => resp.json())
        .then((jsn) => {
          let user = jsn[0];
          if (user && user.id !== -1) {
            setUser(user);
          } else {
            setError('There was an error creating your account.');
          }
        })
        .catch((e) => setError(e));
    }
  }
  return (
    <div>
      {error ? <div>{error}</div> : null}
      <form>
        <div>
          <label>Email</label>
          <input type="text" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a
            className="small"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}>
            {showPassword ? 'Hide' : 'Show'} Password
          </a>
        </div>
        {signIn ? null : (
          <>
            <div>
              <label>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => setConfPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Display Name</label>
              <input
                type="text"
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <button
            type="button"
            onClick={() => {
              signIn ? doSignIn() : doSignUp();
            }}>
            {signIn ? 'Sign In' : 'Sign Up'}
          </button>
          <a
            className="small"
            onClick={(e) => {
              e.preventDefault();
              setSignIn(!signIn);
            }}>
            Sign {signIn ? 'Up' : 'In'}
          </a>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
