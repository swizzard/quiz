import React, { useState } from 'react';
import { postAnswers } from './db/game';

function newAnswers(game, { id }) {
  const anss = {};
  game.quizRound.forEach(({ answer: answers }) => {
    answers.forEach(({ ansId }) => (anss[ansId] = ''));
  });
  return { playerId: id, answers: anss };
}

export default function PlayerGame({ game, user }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState(newAnswers(game, user));
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState(null);
  const finalRound = game.quizRound.length - 1;

  function setAnswer(ansId, response) {
    answers[ansId] = response;
    setAnswers(answers);
  }

  function submitAnswers() {
    setError(null);
    const errMessage = 'There was an error submitting your answers';
    postAnswers(user, answers)
      .then((resp) => {
        if (resp.ok) {
          setPosted(true);
        } else {
          setError(errMessage);
        }
      })
      .catch(() => setError(errMessage));
  }

  function PlayerQuestion({ question: { answer: anss }, questionNo, roundNo }) {
    return (
      <div key={`${game.code}-${roundNo}-${questionNo}`}>
        <h3>{questionNo}</h3>
        {anss.map(({ id: ansId }) => (
          <div key={`${ansId}`}>
            <input
              type="text"
              placeholder="Your Answer"
              onChange={(e) => {
                setAnswer(ansId, e.target.value);
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3>
        {game.name} - Round {currentRound + 1}
      </h3>
      {error ? <div>{error}</div> : null}
      {posted ? (
        <div>
          <h4>Your answers have been submitted! Thanks for playing!</h4>
        </div>
      ) : (
        <div>
          <div>
            {game.quizRound[currentRound].map((question, ix) => (
              <PlayerQuestion
                question={question}
                questionNo={ix}
                roundNo={currentRound}
              />
            ))}
          </div>
          <div>
            {currentRound < finalRound ? (
              <button onClick={() => setCurrentRound(currentRound + 1)}>
                Next Round
              </button>
            ) : null}
            {currentRound > 1 ? (
              <button onClick={() => setCurrentRound(currentRound - 1)}>
                Previous Round
              </button>
            ) : null}
          </div>
        </div>
      )}
      {currentRound === finalRound ? (
        <div>
          <button
            onClick={() => submitAnswers(answers, user, setError, setPosted)}>
            Submit Answers
          </button>
        </div>
      ) : null}
    </div>
  );
}
