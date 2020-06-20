import React, { useEffect, useState } from 'react';
import { createHostedGame, getParticipants } from './db/game';
import ScoreGame from './ScoreGame';

export default function HostGame({ game, user }) {
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRound, setMaxRound] = useState(0);
  const [score, setScore] = useState(false);

  useEffect(() => {
    createHostedGame(user.id, game.quizId)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error('There was a problem starting your game');
        }
      })
      .then((code) => {
        game.code = code;
        setCurrentGame(game);
        setMaxRound(game.quizRounds.length - 1);
      })
      .catch((e) => setError(e.message));
  }, [game, user.id]);

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

  if (score) {
    return <ScoreGame code={game.code} />;
  } else if (!game) {
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
            <h4>{game.quizName}</h4>
          </div>
        </div>
        <CopyCodeButton code={game.code} />
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
              key={`game-${game.quizId}-round-${currentRound}`}
              roundNo={currentRound}
              questions={game.quizRounds[currentRound].questions}
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
  const copyCode = () =>
    navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      .catch(() => setErr(true));
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Code: {code}</h5>
        <h6 className="card-subtitle">
          Send this code to your players so they can join the game!
        </h6>
      </div>
      <div className="card-body">
        {!copied && !err ? (
          <button className="btn btn-dark" type="button" onClick={copyCode}>
            Copy
          </button>
        ) : copied ? (
          <span className="small">Copied!</span>
        ) : (
          <span className="bg-danger">
            An error occurred&mdash;please copy the code manually.
          </span>
        )}
      </div>
    </div>
  );
}
