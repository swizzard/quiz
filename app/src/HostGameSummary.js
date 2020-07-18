import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

function countQuestions(game) {
  let numQs = 0;
  game.quizRounds.forEach((r) => (numQs += r.questions.length));
  return numQs;
}
export default function HostGameSummary({ quiz, remove, selectLabel }) {
  const match = useRouteMatch();
  return (
    <>
      <div className="row draft-game-row">
        <div className="col-sm-12">
          <h3>{quiz.quizName}</h3>
        </div>
      </div>
      <div className="row draft-game-row">
        <div className="col-sm-6">
          <p>Rounds: {quiz.quizRounds.length}</p>
        </div>
        <div className="col-sm-6">
          <p>Questions: {countQuestions(quiz)}</p>
        </div>
      </div>
      <div className="row draft-game-row">
        <div className="col-sm-12 btn-group">
          <Link
            className="btn btn-dark"
            to={`${match.path}/edit/${quiz.quizId}`}
          >
            {selectLabel}
          </Link>
          <button className="btn btn-dark" onClick={remove}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
