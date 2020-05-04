import React, { useEffect, useState } from "react";
import { getParticipantAnswers, submitScore } from "./db/game";

export default function ScoreGame({ game }) {
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [currentParticipant, setCurrentParticipant] = useState(0);
  const [participantScores, setParticipantScores] = useState([]);

  function getResponses() {
    getParticipantAnswers(game.code)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error("There was a problem retrieving participants' answers.");
        }
      })
      .then(([{ participants }]) => {
        setAnswers(fmtAnswers(participants));
      });
    // .catch((e) => setError(e.message));
  }

  useEffect(getResponses, [answers]);

  function submitParticipantScore(participantId, displayName, score) {
    submitScore(participantId, score)
      .then((resp) => {
        if (resp.ok) {
          setParticipantScores([...participantScores, { id: participantId, score, displayName }]);
          setCurrentParticipant(currentParticipant + 1);
        } else {
          throw new Error("There was an error submitting the score.");
        }
      })
      .catch((e) => setError(e.message));
  }

  if (!answers) {
    return <Loading error={error} />;
  }
  if (currentParticipant < answers.length) {
    return <Scoring answers={answers} currentParticipant={currentParticipant} error={error} submitParticpantScore={submitParticipantScore} />;
  }
  return <Results participantScores={participantScores} />;
}

function Results({ participantScores }) {
  return (
    <div>
      <h2>Final Scores</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {doSort(participantScores).map(({ rank, score, displayName }) => (
            <tr>
              <td>{rank}</td>
              <td>{score}</td>
              <td>{displayName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Scoring({ answers, currentParticipant, error, submitParticipantScore }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentScore, setCurrentScore] = useState({});
  function updateScore(answerId, val) {
    setCurrentScore({ ...currentScore, [answerId]: val });
  }
  return (
    <div>
      {error ? <div>{error}</div> : null}
      <form>
        <div>
          <h2>Team: {answers[currentParticipant].displayName}</h2>
          <h3>Round {currentRound}</h3>
          <div>
            {answers[currentParticipant].responses[currentRound].map(({ question: { question, questionId }, answers: responses }) => {
              return <ScoringQuestion key={questionId} question={question} responses={responses} updateScore={updateScore} />;
            })}
          </div>
        </div>
        <div>
          {currentRound < answers[currentParticipant].responses.length - 1 ? (
            <button type="button" onClick={() => setCurrentRound(currentRound + 1)}>
              Next Round
            </button>
          ) : null}
          {currentRound > 0 ? (
            <button type="button" onClick={() => setCurrentRound(currentRound - 1)}>
              Previous Round
            </button>
          ) : null}
          {currentRound === answers[currentParticipant].responses.length - 1 && currentParticipant < answers.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                const totalScore = Object.values(currentScore).reduce((c, v) => c + v, 0);
                submitParticipantScore(answers[currentParticipant].participantId, answers[currentParticipant].displayName, totalScore);
              }}
            >
              Submit Score
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function Loading({ error }) {
  return (
    <div>
      <h3>{error ? error : "Loading..."}</h3>
    </div>
  );
}

function ScoringQuestion({ question, responses, updateScore }) {
  return (
    <div>
      <h4>{question}</h4>
      {Object.values(responses).map(({ answer, answerId, points, response }) => (
        <ScoringAnswer answer={answer} answerId={answerId} points={points} response={response} setCurrentScore={updateScore} key={answerId} />
      ))}
    </div>
  );
}

function ScoringAnswer({ answer, answerId, points, response, updateScore }) {
  return (
    <div>
      <div>
        <label htmlFor={`answer-${answerId}`}>Answer:</label>
        <input disabled type="text" value={answer} id={`answer-${answerId}`} />
      </div>
      <div>
        <label htmlFor={`response-${answerId}`}>Their Response:</label>
        <input disabled type="text" value={response} id={`response-${answerId}`} />
      </div>
      <div>
        <label htmlFor={`points-${answerId}`}>Points:</label>
        <input
          type="number"
          placeholder="0"
          id={`points-${answerId}`}
          onChange={(e) => {
            updateScore(answerId, e.target.value);
          }}
        />
        <label htmlFor={`answerPoints-${answerId}`}>Points for a correct answer:</label>
        <input disabled type="number" value={points} id={`answerPoints-${answerId}`} />
      </div>
    </div>
  );
}

function fmtAnswers(ps) {
  const resps = ps.reduce((acc, { id, responses: resps }) => {
    acc.push({
      id,
      responses: resps.reduce((acc, { answer: { answer, answerId, points, question: { questionId, questionNo, question, round: { roundNo } } }, response }) => {
        const currRound = acc[roundNo] || [];
        const currQ = currRound[questionNo] || { questionId, question, answers: {} };
        currQ.answers[answerId] = { answerId, answer, response, points };
        currRound[questionNo] = currQ;
        acc[roundNo] = currRound;
        return acc;
      }, {})
    });
    return acc;
  }, []);
  return resps;
}

function doSort(ps) {
  ps.sort((a, b) => b.score - a.score);
  let currRank = 1;
  let currScore = ps[0].score;
  const ranked = [];
  ps.forEach(({ score, displayName }) => {
    if (score < currScore) {
      currRank += 1;
      currScore = score;
    }
    ranked.push({ rank: currRank, score, displayName });
  });
  return ranked;
}
