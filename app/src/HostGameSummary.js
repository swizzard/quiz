import React from 'react';
import { deleteGame } from './db/games';

function countQuestions(game) {
  let numQs = 0;
  game.rounds.forEach((r) => (numQs += r.questions.length));
  return numQs;
}
export default function HostGameSummary({ game, select, selectLabel, user }) {
  return (
    <div>
      <h3>{game.name}</h3>
      <p>Rounds: {game.quiz_round.length}</p>
      <p>Questions: {countQuestions(game)}</p>
      <button onClick={() => select(game)}>{selectLabel}</button>
      <button onClick={() => deleteGame(game, user)}>Delete</button>
    </div>
  );
}
