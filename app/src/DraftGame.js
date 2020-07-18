import React, { useEffect, useReducer, useState } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import { getHostGame, submitDraft, updateDraft } from './db/game';
import { draftGameReducer, types } from './reducers/draft';
import { AuthRedirect } from './Routes';

const UP_ARROW = <span>&#9650;</span>;
const DOWN_ARROW = <span>&#9660;</span>;

export default function DraftGame({ user, forceUpdate }) {
  const match = useRouteMatch(['/draft/new', '/draft/edit/:gameId']);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(true);
  const [state, dispatch] = useReducer(draftGameReducer, {});
  const history = useHistory();

  function goBack() {
    history.push('/draft');
  }

  function getGame() {
    if (match.params.gameId) {
      getHostGame(user.id, match.params.gameId)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else if (resp.status === 406) {
            setAuthorized(false);
            throw new Error('unauthorized');
          } else {
            throw new Error(resp.text);
          }
        })
        .then((g) => dispatch({ type: types.LOAD_GAME, game: g }));
    } else {
      const newGame = {
        name: '',
        creator: {
          display_name: user.display_name,
          id: user.id
        },
        quizRounds: []
      };
      dispatch({ type: types.LOAD_GAME, game: newGame });
    }
  }

  useEffect(() => getGame(), [user]);

  if (!authorized) {
    return <AuthRedirect />;
  }
  if (isEmpty(state)) {
    return (
      <div className="row">
        <div className="col-sm-12">
          <h4>Loading...</h4>
        </div>
      </div>
    );
  }
  return (
    <>
      {error ? (
        <div className="row">
          <div className="col-sm-12 error">{error}</div>
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
              onChange={(e) => {
                setError(null);
                dispatch({ type: types.CHANGE_NAME, name: e.target.value });
              }}
            />
          </div>
        </div>
        <div className="card-columns">
          {state.quizRounds.map((round, ix) => (
            <Round
              ix={ix}
              questions={round.questions}
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
                forceUpdate,
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
              points: parseInt(e.target.value),
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
      <div className="form-group">
        <div className="btn-group">
          <button
            className="btn btn-dark btn-sm"
            type="button"
            title="Move answer up"
            onClick={() =>
              dispatch({
                type: types.REORDER_ANSWER,
                roundIx,
                qIx,
                answerIx,
                step: -1
              })
            }
          >
            {UP_ARROW}
          </button>
          <button
            className="btn btn-dark btn-sm"
            type="button"
            title="Move answer down"
            onClick={() =>
              dispatch({
                type: types.REORDER_ANSWER,
                roundIx,
                qIx,
                answerIx,
                step: 1
              })
            }
          >
            {DOWN_ARROW}
          </button>
        </div>
      </div>
    </li>
  );
}

function Question({ roundIx, qIx, q, dispatch }) {
  return (
    <div className="card-body question">
      <textarea
        rows="5"
        cols="40"
        className="form-control"
        value={q.question}
        onChange={(e) => {
          dispatch({
            type: types.CHANGE_QUESTION,
            roundIx,
            qIx,
            question: e.target.value
          });
        }}
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
      <div className="btn-group">
        <button
          className="btn btn-dark btn-sm"
          type="button"
          title="Move question up"
          onClick={() =>
            dispatch({ type: types.REORDER_QUESTION, roundIx, qIx, step: -1 })
          }
        >
          {UP_ARROW}
        </button>
        <button
          className="btn btn-dark btn-sm"
          type="button"
          title="Move question down"
          onClick={() =>
            dispatch({ type: types.REORDER_QUESTION, roundIx, qIx, step: 1 })
          }
        >
          {DOWN_ARROW}
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
                dispatch({ type: types.DELETE_ROUND, roundIx: ix });
              }}
            >
              Remove Round
            </button>
          </div>
        </div>
        <div className="col-sm-12">
          <div className="btn-group">
            <button
              className="btn btn-dark btn-sm"
              type="button"
              title="Move round up"
              onClick={() =>
                dispatch({ type: types.REORDER_ROUND, roundIx: ix, step: -1 })
              }
            >
              {UP_ARROW}
            </button>
            <button
              className="btn btn-dark btn-sm"
              type="button"
              title="Move round down"
              onClick={() =>
                dispatch({ type: types.REORDER_ROUND, roundIx: ix, step: 1 })
              }
            >
              {DOWN_ARROW}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function postDraft(
  user,
  id,
  questions,
  name,
  goBack,
  forceUpdate,
  setError
) {
  setError(null);
  if (!name || name.trim().length < 1) {
    setError('Quiz name cannot be blank.');
  } else {
    try {
      const resp = await (id
        ? updateDraft(user, id, name, questions)
        : submitDraft(user, name, questions));
      if (resp.ok) {
        forceUpdate();
        goBack();
      } else {
        throw new Error('');
      }
    } catch (_e) {
      setError('There was a problem submitting your game.');
    }
  }
}
