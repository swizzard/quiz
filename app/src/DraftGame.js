import React, { useReducer, useState } from "react";
import { submitDraft, updateDraft } from "./db/game";
import { draftGameReducer, types } from "./reducers/draft";

function Answer({ answer, qIx, roundIx, answerIx, points, dispatch }) {
  const id = `${roundIx}-${qIx}-${answerIx}`;
  return (
    <div>
      <div>
        <label htmlFor={`${id}-answer`}>Answer: </label>
        <input
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
      <div>
        <label htmlFor={`${id}-points`}>Points: </label>
        <input
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
      <div>
        <button type="button" onClick={() => dispatch({ type: types.DELETE_ANSWER, roundIx, qIx, answerIx })}>
          Remove Answer
        </button>
      </div>
    </div>
  );
}

function Question({ roundIx, qIx, q, dispatch }) {
  return (
    <div>
      <input
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
      {q.answers.map(({ answer, points }, answerIx) => (
        <Answer answer={answer} roundIx={roundIx} qIx={qIx} answerIx={answerIx} points={points} dispatch={dispatch} key={`${roundIx}-${qIx}-${answerIx}`} />
      ))}
      <button type="button" onClick={() => dispatch({ type: types.ADD_ANSWER, roundIx, qIx })}>
        Add Answer
      </button>
      <button type="button" onClick={() => dispatch({ type: types.DELETE_QUESTION, roundIx, qIx })}>
        Remove Question
      </button>
    </div>
  );
}

function Round({ ix, questions, dispatch }) {
  return (
    <div>
      <div>
        {questions.map((q, qIx) => {
          return <Question roundIx={ix} qIx={qIx} q={q} dispatch={dispatch} key={`${ix}-${qIx}`} />;
        })}
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: types.ADD_QUESTION, roundIx: ix });
          }}
        >
          Add Question
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch({ types: types.DELETE_ROUND, roundIx: ix });
          }}
        >
          Remove Round
        </button>
      </div>
    </div>
  );
}

function postDraft(user, id, questions, name, goBack, setError) {
  setError(null);
  (id ? updateDraft(user, id, name, questions) : submitDraft(user, name, questions)).then(() => goBack()).catch(setError("There was a problem submitting your game."));
}

export default function DraftGame({ game, goBack, user }) {
  const [error, setError] = useState(null);
  const [state, dispatch] = useReducer(draftGameReducer, game);

  return (
    <div>
      {error ? <div>{error}</div> : null}
      <form>
        <div>
          <label htmlFor="quizName">Title</label>
          <input id="quizName" value={state.quizName} onChange={(e) => dispatch({ type: types.CHANGE_NAME, name: e.target.value })} />
        </div>
        <div>
          {state.quizRounds.map((_, ix) => (
            <Round ix={ix} questions={state.quizRounds[ix].questions} dispatch={dispatch} key={`round-${ix}`} />
          ))}
        </div>
        <div>
          <button type="button" onClick={() => dispatch({ type: types.ADD_ROUND })}>
            Add Round
          </button>
          <button
            type="button"
            onClick={() => {
              postDraft(user, state.quizId, state.quizRounds, state.quizName, goBack, setError);
            }}
          >
            Submit
          </button>
          <button type="button" onClick={() => goBack()}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
