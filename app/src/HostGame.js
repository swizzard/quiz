import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { createHostedGame, getHostGame, getParticipants } from './db/game';
import ScoreGame from './ScoreGame';
import { AuthRedirect } from './Routes';

export default function HostGame({ user }) {
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRound, setMaxRound] = useState(0);
  const [authorized, setAuthorized] = useState(true);
  const [score, setScore] = useState(false);
  const history = useHistory();
  const match = useRouteMatch();

  function goBack() {
    history.push('/host');
  }

  async function getGame() {
    const { gameId } = match.params;
    const resp = await getHostGame(user.id, gameId);
    if (resp.ok) {
      return resp.json();
    } else if (resp.status === 406) {
      setAuthorized(false);
      throw new Error('unauthroized');
    } else {
      throw new Error('There was a problem retrieving your game');
    }
  }

  async function getCode() {
    const { gameId } = match.params;
    const resp = await createHostedGame(user.id, gameId);
    if (resp.ok) {
      return resp.json();
    } else {
      throw new Error('There was an error starting your game');
    }
  }

  async function hostGame() {
    try {
      const game = await getGame();
      const code = await getCode();
      game.code = code;
      setCurrentGame(game);
      setMaxRound(game.quizRounds.length - 1);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    hostGame();
  }, [user.id, match.params.gameId]);

  function updateParticipants() {
    setError(null);
    getParticipants(currentGame.code)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error(resp.statusText);
        }
      })
      .then(({ participants }) => {
        setParticipants(participants);
      })
      .catch((e) => setError(e.message));
  }

  if (!authorized) {
    return <AuthRedirect />;
  } else if (score) {
    return <ScoreGame code={currentGame.code} />;
  } else if (!currentGame) {
    return (
      <div className="row">
        <div className={`col-sm-12 ${error ? 'bg-error' : ''}`}>
          {error ? error : 'Loading...'}
        </div>
      </div>
    );
  } else {
    return (
      <>
        {error ? (
          <div className="row">
            <div className="col-sm-12 bg-error">{error}</div>
          </div>
        ) : null}
        <div className="row">
          <div className="col-sm-12">
            <h4>{currentGame.quizName}</h4>
          </div>
        </div>
        <CopyCodeButton code={currentGame.code} />
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <h5>Participants</h5>
                <ul className="list-group list-group-flush">
                  {participants.length
                    ? participants.map(({ player: { displayName } }, ix) => (
                        <li key={`${displayName}-${ix}`}>{displayName}</li>
                      ))
                    : null}
                </ul>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-dark"
                  type="button"
                  onClick={() => updateParticipants()}
                >
                  Refresh Participants
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Round
              key={`game-${currentGame.quizId}-round-${currentRound}`}
              roundNo={currentRound}
              questions={currentGame.quizRounds[currentRound].questions}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 btn-group">
            {currentRound < maxRound ? (
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => setCurrentRound(currentRound + 1)}
              >
                Next Round
              </button>
            ) : null}
            {currentRound > 0 ? (
              <button
                className="btn btn-dark btn-small"
                type="button"
                onClick={() => setCurrentRound(currentRound - 1)}
              >
                Previous Round
              </button>
            ) : null}
            {currentRound === maxRound ? (
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => setScore(true)}
              >
                Score Game
              </button>
            ) : null}
          </div>
        </div>
      </>
    );
  }
}

function Round({ roundNo, questions }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Round: {roundNo + 1}</h5>
        <ul className="list-group list-group-flush">
          {questions.map(({ question, answers }, ix) => (
            <HostQuestion
              key={`question-${roundNo}-${ix}`}
              question={question}
              ix={ix}
              answers={answers}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function HostQuestionAnswers({ answers, ix }) {
  return (
    <div className="col-sm-3">
      <ul className="answers-list small">
        <li key={`${ix}-title`}>Points</li>
        {answers.map(({ points }, pIx) => (
          <li key={`${ix}-${pIx}`}>{points}</li>
        ))}
      </ul>
    </div>
  );
}

function HostQuestion({ question, answers, ix }) {
  return (
    <li className="list-group-item">
      <div className="row">
        <div className="col-sm-9">
          <b>{`${ix + 1}.`}</b> <span>{question}</span>
        </div>
        <HostQuestionAnswers key={`${ix}-answers`} answers={answers} ix={ix} />
      </div>
    </li>
  );
}

function CopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState(false);
  const link = `${window.location.origin}/play/${code}`;
  const copyLink = () =>
    navigator.clipboard
      .writeText(link)
      .then(() => setCopied(true))
      .catch(() => setErr(true));
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Link: {link}</h5>
        <h6 className="card-subtitle">
          Send this link to your players so they can join the game!
        </h6>
      </div>
      <div className="card-body">
        {!copied && !err ? (
          <button className="btn btn-dark" type="button" onClick={copyLink}>
            Copy
          </button>
        ) : copied ? (
          <span className="small">Copied!</span>
        ) : (
          <span className="bg-danger">
            An error occurred&mdash;please copy the link manually.
          </span>
        )}
      </div>
    </div>
  );
}
