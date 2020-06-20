import React from 'react';

function countQuestions(game) {
  let numQs = 0;
  game.quizRounds.forEach((r) => (numQs += r.questions.length));
  return numQs;
}
export default function HostGameSummary({ quiz, remove, select, selectLabel }) {
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <h3>{quiz.quizName}</h3>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <p>Rounds: {quiz.quizRounds.length}</p>
        </div>
        <div className="col-sm-6">
          <p>Questions: {countQuestions(quiz)}</p>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 btn-group">
          <button className="btn btn-dark" onClick={() => select(quiz)}>
            {selectLabel}
          </button>
          <button className="btn btn-dark" onClick={remove}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
