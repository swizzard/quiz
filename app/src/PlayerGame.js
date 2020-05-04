import React, { useState } from "react";
import { postAnswers } from "./db/game";

function newAnswers(game) {
  const anss = {};
  game.quizRounds.forEach(({ questions }) => {
    questions.forEach(({ answers }) => {
      answers.forEach(({ answerId }) => (anss[answerId] = ""));
    });
  });
  return anss;
}

function PlayerAnswer({ answers, answerId, setAnswer }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Your Answer"
        onChange={(e) => {
          setAnswer(answerId, e.target.value);
        }}
        value={answers[answerId]}
      />
    </div>
  );
}

function PlayerQuestion({ question: { answers: anss }, questionNo, setAnswer, answers }) {
  return (
    <div>
      <h3>{questionNo + 1}</h3>
      {anss.map(({ answerId }) => (
        <PlayerAnswer key={`${answerId}-answer`} answers={answers} answerId={answerId} setAnswer={setAnswer} />
      ))}
    </div>
  );
}

export default function PlayerGame({ game, participantId }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [answers, setAnswers] = useState(newAnswers(game));
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState(null);
  const finalRound = game.quizRounds.length - 1;

  function setAnswer(ansId, response) {
    const as = { ...answers };
    as[ansId] = response;
    setAnswers(as);
  }

  function submitAnswers() {
    setError(null);
    const errMessage = "There was an error submitting your answers";
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
            {game.quizRounds[currentRound].questions.map((question, ix) => {
              return <PlayerQuestion key={`${currentRound}-question-${ix}`} question={question} questionNo={ix} setAnswer={setAnswer} answers={answers} />;
            })}
          </div>
          <div>
            {currentRound < finalRound ? <button onClick={() => setCurrentRound(currentRound + 1)}>Next Round</button> : null}
            {currentRound > 0 ? <button onClick={() => setCurrentRound(currentRound - 1)}>Previous Round</button> : null}
          </div>
        </div>
      )}
      {currentRound === finalRound && !posted ? (
        <div>
          <button onClick={() => submitAnswers()}>Submit Answers</button>
        </div>
      ) : null}
    </div>
  );
}
