import React, { useReducer, useState } from 'react';
import { submitDraft, updateDraft } from './db/game';
import { draftGameReducer, types } from './reducers/draft';

function Answer({ answer, qIx, roundIx, answerIx, points, dispatch }) {
  const id = `${roundIx}-${qIx}-${answerIx}`;
  return (
    <li className="list-group-item">
      <div className="form-group">
        <label className="form-label" htmlFor={`${id}-answer`}>
          Answer:
        </label>
        <input
          className="form-control"
          type="text"
          onChange={(e) =>
            dispatch({
              type: types.CHANGE_ANSWER,
              points,
              answer: e.target.value,
              roundIx,
              qIx,
              answerIx
            })
          }
          placeholder="Answer"
          value={answer}
          id={`${id}-answer`}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor={`${id}-points`}>
          Points:{' '}
        </label>
        <input
          className="form-control"
          type="number"
          onChange={(e) =>
            dispatch({
              type: types.CHANGE_ANSWER,
              points: e.target.value,
              answer,
              roundIx,
              qIx,
              answerIx
            })
          }
          value={points}
          id={`${id}-points`}
        />
      </div>
      <div className="form-group">
        <div className="btn-group">
          <button
            className="btn btn-dark"
            type="button"
            onClick={() =>
              dispatch({ type: types.DELETE_ANSWER, roundIx, qIx, answerIx })
            }
          >
            Remove Answer
          </button>
        </div>
      </div>
    </li>
  );
}

function Question({ roundIx, qIx, q, dispatch }) {
  return (
    <div className="card-body">
      <input
        className="form-control"
        type="text"
        value={q.question}
        onChange={(e) =>
          dispatch({
            type: types.CHANGE_QUESTION,
            roundIx,
            qIx,
            question: e.target.value
          })
        }
      />
      <ul className="list-group list-group-flush">
        {q.answers.map(({ answer, points }, answerIx) => (
          <Answer
            answer={answer}
            roundIx={roundIx}
            qIx={qIx}
            answerIx={answerIx}
            points={points}
            dispatch={dispatch}
            key={`${roundIx}-${qIx}-${answerIx}`}
          />
        ))}
      </ul>
      <div className="btn-group">
        <button
          className="btn btn-dark"
          type="button"
          onClick={() => dispatch({ type: types.ADD_ANSWER, roundIx, qIx })}
        >
          Add Answer
        </button>
        <button
          className="btn btn-dark"
          type="button"
          onClick={() =>
            dispatch({ type: types.DELETE_QUESTION, roundIx, qIx })
          }
        >
          Remove Question
        </button>
      </div>
    </div>
  );
}

function Round({ ix, questions, dispatch }) {
  return (
    <div className="card w-100 p-3">
      {questions.map((q, qIx) => {
        return (
          <Question
            roundIx={ix}
            qIx={qIx}
            q={q}
            dispatch={dispatch}
            key={`${ix}-${qIx}`}
          />
        );
      })}
      <div className="card-footer">
        <div className="col-sm-12">
          <div className="btn-group">
            <button
              className="btn btn-dark"
              type="button"
              onClick={() => {
                dispatch({ type: types.ADD_QUESTION, roundIx: ix });
              }}
            >
              Add Question
            </button>
            <button
              className="btn btn-dark"
              type="button"
              onClick={() => {
                dispatch({ types: types.DELETE_ROUND, roundIx: ix });
              }}
            >
              Remove Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function postDraft(user, id, questions, name, goBack, setError) {
  setError(null);
  (id
    ? updateDraft(user, id, name, questions)
    : submitDraft(user, name, questions)
  )
    .then(() => goBack())
    .catch(setError('There was a problem submitting your game.'));
}

export default function DraftGame({ game, goBack, user }) {
  const [error, setError] = useState(null);
  const [state, dispatch] = useReducer(draftGameReducer, game);

  return (
    <>
      {error ? (
        <div className="row">
          <div className="col-sm-12">{error}</div>
        </div>
      ) : null}
      <form>
        <div className="form-group row">
          <label className="col-sm-2 form-control-label" htmlFor="quizName">
            Title
          </label>
          <div className="col-sm-10">
            <input
              id="quizName"
              className="form-control"
              value={state.quizName}
              onChange={(e) =>
                dispatch({ type: types.CHANGE_NAME, name: e.target.value })
              }
            />
          </div>
        </div>
        <div className="card-columns">
          {state.quizRounds.map((_, ix) => (
            <Round
              ix={ix}
              questions={state.quizRounds[ix].questions}
              dispatch={dispatch}
              key={`round-${ix}`}
            />
          ))}
        </div>
        <div className="btn-group">
          <button
            className="btn btn-dark"
            type="button"
            onClick={() => dispatch({ type: types.ADD_ROUND })}
          >
            Add Round
          </button>
          <button
            className="btn btn-dark"
            type="button"
            onClick={() => {
              postDraft(
                user,
                state.quizId,
                state.quizRounds,
                state.quizName,
                goBack,
                setError
              );
            }}
          >
            Submit
          </button>
          <button
            className="btn btn-dark"
            type="button"
            onClick={() => goBack()}
          >
            Back
          </button>
        </div>
      </form>
    </>
  );
}
