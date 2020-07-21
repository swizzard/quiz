import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { AuthRedirect } from './Routes';
import { joinGame, postAnswers } from './db/game';

function newAnswers(game) {
  const anss = {};
  game.quizRounds.forEach(({ questions }) => {
    questions.forEach(({ answers }) => {
      answers.forEach(({ answerId }) => (anss[answerId] = ''));
    });
  });
  return anss;
}

function PlayerAnswer({ answers, answerId, setAnswer }) {
  if (!answers) {
    return '';
  }
  return (
    <li className="list-group-item">
      <input
        type="text"
        placeholder="Your Answer"
        onChange={(e) => {
          setAnswer(answerId, e.target.value);
        }}
        value={answers[answerId]}
      />
    </li>
  );
}

function PlayerQuestion({
  question: { answers: anss },
  questionNo,
  setAnswer,
  answers
}) {
  return (
    <li className="list-group-item">
      <h3>Question {questionNo + 1}</h3>
      <ul className="list-group">
        {anss.map(({ answerId }) => (
          <PlayerAnswer
            key={`${answerId}-answer`}
            answers={answers}
            answerId={answerId}
            setAnswer={setAnswer}
          />
        ))}
      </ul>
    </li>
  );
}

function PlayerButtons({
  currentRound,
  setCurrentRound,
  finalRound,
  submitAnswers
}) {
  if (finalRound < 0) {
    return '';
  }
  return (
    <>
      {currentRound === finalRound ? (
        <button className="btn btn-dark" onClick={() => submitAnswers()}>
          Submit Answers
        </button>
      ) : null}
      {currentRound < finalRound ? (
        <button
          className="btn btn-dark"
          onClick={() => setCurrentRound(currentRound + 1)}
        >
          Next Round
        </button>
      ) : null}
      {currentRound > 0 ? (
        <button
          className="btn btn-dark"
          onClick={() => setCurrentRound(currentRound - 1)}
        >
          Previous Round
        </button>
      ) : null}
    </>
  );
}

export default function PlayerGame({ user }) {
  const [authorized, setAuthorized] = useState(true);
  const [game, setGame] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [answers, setAnswers] = useState(null);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState(null);
  const [finalRound, setFinalRound] = useState(-1);
  const match = useRouteMatch();

  async function loadGame() {
    const { gameCode } = match.params;
    const resp = await joinGame(user.id, gameCode);
    if (resp.ok) {
      const [
        {
          participantId: pId,
          game: { quiz: g }
        }
      ] = await resp.json();
      setParticipantId(pId);
      setGame(g);
      setAnswers(newAnswers(g));
      setFinalRound(g.quizRounds.length - 1);
    } else if (resp.status === 406) {
      setAuthorized(false);
    } else {
      setError('There was a problem loading your game');
    }
  }

  useEffect(() => {
    loadGame();
  }, [user.id, match.params.gameCode]);

  function setAnswer(ansId, response) {
    const as = { ...answers };
    as[ansId] = response;
    setAnswers(as);
  }

  function submitAnswers() {
    setError(null);
    const errMessage = 'There was an error submitting your answers';
    postAnswers(participantId, answers)
      .then((resp) => {
        if (resp.ok) {
          setPosted(true);
        } else {
          setError(errMessage);
        }
      })
      .catch(() => setError(errMessage));
  }

  if (!authorized) {
    return <AuthRedirect />;
  }
  if (!game) {
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  }
  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">
              {game.name} - Round {currentRound + 1}
            </h3>
          </div>
          {error ? <div className="card-body bg-error">{error}</div> : null}
          {posted ? (
            <div className="card-body">
              <h4>Your answers have been submitted! Thanks for playing!</h4>
            </div>
          ) : (
            <>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {game.quizRounds[currentRound].questions.map(
                    (question, ix) => {
                      return (
                        <PlayerQuestion
                          key={`${currentRound}-question-${ix}`}
                          question={question}
                          questionNo={ix}
                          setAnswer={setAnswer}
                          answers={answers}
                        />
                      );
                    }
                  )}
                </ul>
              </div>
              <div className="card-footer">
                <div className="btn-group">
                  <PlayerButtons
                    currentRound={currentRound}
                    setCurrentRound={setCurrentRound}
                    finalRound={finalRound}
                    submitAnswers={submitAnswers}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
