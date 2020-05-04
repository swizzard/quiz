import React from "react";

function countQuestions(game) {
  let numQs = 0;
  game.quizRounds.forEach((r) => (numQs += r.questions.length));
  return numQs;
}
export default function HostGameSummary({ quiz, remove, select, selectLabel }) {
  return (
    <div>
      <h3>{quiz.quizName}</h3>
      <p>Rounds: {quiz.quizRounds.length}</p>
      <p>Questions: {countQuestions(quiz)}</p>
      <button onClick={() => select(quiz)}>{selectLabel}</button>
      <button onClick={remove}>Delete</button>
    </div>
  );
}
