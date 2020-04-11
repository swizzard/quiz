import React, { useState } from 'react';
import { postAnswers } from './db/games';

function newAnswers(game, { display_name, id }) {
  return {
    player: {
      display_name,
      id,
    },
    answers: game.quiz_round.map(() => []),
  };
}

function setAnswer(roundNo, questionNo) {
  return (ans, response, setAns) => {
    ans[roundNo][questionNo] = response;
    setAns(ans);
  };
}

function submitAnswers(answers, user, setError, setPosted) {
  setError(null);
  postAnswers(user, answers).then((resp) => {
    if (resp.ok) {
      setPosted(true);
    } else {
      setError('There was an error submitting your answers');
    }
  });
}

function PlayerAnswer({ answers, game, roundNo, questionNo, setAnswers }) {
  const sa = setAnswer(roundNo, questionNo);
  return (
    <div key={`${game.quiz_code}-${roundNo}-${questionNo}`}>
      <input
        type="text"
        placeholder="Your Answer"
        onChange={(e) => sa(answers, e.target.value, setAnswers)}
      />
    </div>
  );
}

export default function PlayerGame({ game, user }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState(newAnswers(game, user));
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState(null);
  const finalRound = game.quiz_round.length - 1;

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
            {game.quiz_round[currentRound].map((_, ix) => (
              <PlayerAnswer
                answers={answers}
                game={game}
                roundNo={currentRound}
                questionNo={ix}
                setAnswers={setAnswers}
              />
            ))}
          </div>
          <div>
            {currentRound < finalRound ? (
              <button onClick={() => setCurrentRound(currentRound++)}>
                Next Round
              </button>
            ) : null}
            {currentRound > 1 ? (
              <button onClick={() => setCurrentRound(currentRound--)}>
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
