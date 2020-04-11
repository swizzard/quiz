import React from 'react';

function countQuestions(game) {
  let numQs = 0;
  game.rounds.forEach((r) => (numQs += r.questions.length));
  return numQs;
}
export default function HostGameSummary({ game, remove, select, selectLabel }) {
  return (
    <div>
      <h3>{game.quiz.name}</h3>
      <p>Rounds: {game.quiz.quiz_round.length}</p>
      <p>Questions: {countQuestions(game.quiz)}</p>
      <p>Code: {game.code}</p>
      <button onClick={() => select(game)}>{selectLabel}</button>
      <button onClick={remove}>Delete</button>
    </div>
  );
}
