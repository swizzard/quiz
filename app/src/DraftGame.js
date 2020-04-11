import React, { useState } from 'react';
import { submitDraft } from './db/games';

function newQ() {
  return {
    question: '',
    answers: [],
  };
}

function Answer({ answer, ix, points, qs, setQs }) {
  const id = `${roundIx}-${qIx}-${ix}`;
  return (
    <div key={id}>
      <div>
        <label for={`${id}-answer`}>Answer: </label>
        <input
          type="text"
          onChange={(e) => {
            thisQ.answers[ix].answer = e.target.value;
            qs[roundIx][qIx] = thisQ;
            setQs(qs);
          }}
          placeholder="Answer"
          value={answer}
          id={`${id}-answer`}
        />
      </div>
      <div>
        <label for={`${id}-points`}>Points: </label>
        <input
          type="number"
          onChange={(e) => {
            thisQ.answers[ix].points = e.target.value;
            qs[roundIx][qIx] = thisQ;
            setQs(qs);
          }}
          value={points}
          id={`${id}-points`}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            const theseAnswers = thisQ.answers;
            const intermed = theseAnswers.slice(0, ix);
            intermed.push(...theseAnswers.slice(ix + 1));
            thisQ.answers = theseAnswers;
            qs[roundIx][qIx] = thisQ;
            setQs(qs);
          }}>
          Remove Answer
        </button>
      </div>
    </div>
  );
}

function Question({ roundIx, qIx, qs, setQs }) {
  const thisQ = qs[roundIx][qIx] || newQ();
  return (
    <div key={`${roundIx}-${qIx}`}>
      <input
        type="text"
        onChange={(e) => {
          thisQ.question = e.target.value;
          qs[roundIx][qIx] = thisQ;
          setQs(qs);
        }}
      />
      {thisQ.answers.map(({ answer, points }, ix) => (
        <Answer answer={answer} ix={ix} points={points} qs={qs} setQs={setQs} />
      ))}
      <button
        type="button"
        onClick={() => {
          thisQ.answers.push({ answer: '', points: 0 });
          qs[roundIx][qIx] = thisQ;
          setQs(qs);
        }}>
        Add Answer
      </button>
      <button
        type="button"
        onClick={() => {
          const thisRound = qs[roundIx];
          const intermed = thisRound.slice(0, qIx);
          intermed.push(...thisRound.slice(qIx + 1));
          qs[roundIx] = intermed;
          setQs(qs);
        }}>
        Remove Question
      </button>
    </div>
  );
}

function Round({ ix, qs, setQs }) {
  return (
    <div>
      <div>
        {qs.map((_, qix) => (
          <Question roundIx={ix} qIx={qix} qs={qs} setQs={setQs} />
        ))}
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            qs[ix].push(newQ);
            setQs(qs);
          }}>
          Add Question
        </button>
      </div>
    </div>
  );
}

function postDraft(user, questions, name, goBack, setError) {
  setError(null);
  submitDraft(user, name, questions)
    .then(() => goBack())
    .catch(() => {
      setError('There was a problem submitting your game.');
    });
}

export default function DraftGame({ game, goBack, user }) {
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState(game.quiz_rounds);
  const [name, setName] = useState(game.name);
  return (
    <div>
      {error ? <div>{error}</div> : null} }
      <form onSubmit={() => postDraft(user, questions, name, goBack, setError)}>
        <div>
          <label for="quizName">Title</label>
          <input id="quizName" onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          {questions.map((_, ix) => (
            <Round ix={ix} qs={questions} setQs={setQuestions} />
          ))}
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}
