import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { getParticipants, getParticipantAnswers, submitScore } from './db/game';

export default function ScoreGame({ code }) {
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [currentParticipant, setCurrentParticipant] = useState(0);
  const [participantScores, setParticipantScores] = useState([]);

  function getResponses() {
    let playerIds;
    getParticipants(code)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error(resp.statusText);
        }
      })
      .then(({ participants }) => participants.map((p) => p.playerId))
      .then((pids) => {
        playerIds = pids;
        return getParticipantAnswers(pids);
      })
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error(
            "There was a problem retrieving participants' answers."
          );
        }
      })
      .then((participants) => setAnswers(fmtAnswers(playerIds, participants)))
      .catch((e) => setError(e.message));
  }

  useEffect(getResponses, [code]);

  function submitParticipantScore(participantId, displayName, score) {
    submitScore(participantId, score)
      .then((resp) => {
        if (resp.ok) {
          setParticipantScores([
            ...participantScores,
            { id: participantId, score, displayName }
          ]);
          setCurrentParticipant(currentParticipant + 1);
        } else {
          throw new Error('There was an error submitting the score.');
        }
      })
      .catch((e) => setError(e.message));
  }

  if (!answers) {
    return <Loading error={error} />;
  }
  if (currentParticipant < answers.length) {
    return (
      <Scoring
        answers={answers}
        currentParticipant={currentParticipant}
        error={error}
        submitParticipantScore={submitParticipantScore}
      />
    );
  }
  return <Results participantScores={participantScores} />;
}

function Results({ participantScores }) {
  if (!participantScores) {
    return (
      <div>
        <h2>No Scores</h2>
      </div>
    );
  }
  return (
    <div>
      <h2>Final Scores</h2>
      {participantScores.length ? (
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
                <td>{displayName}</td>
                <td>{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h2>No Scores</h2>
      )}
    </div>
  );
}

function Scoring({
  answers,
  currentParticipant,
  error,
  submitParticipantScore
}) {
  const [currentRound, setCurrentRound] = useState(0);
  const [currentScore, setCurrentScore] = useState({});
  function updateScore(answerId, val) {
    setCurrentScore({ ...currentScore, [answerId]: parseInt(val) });
  }
  return (
    <div>
      {error ? <div>{error}</div> : null}
      <form>
        <div>
          <h2>Team: {answers[currentParticipant].displayName}</h2>
          <h3>Round {currentRound}</h3>
          <div>
            {answers[currentParticipant].rounds[currentRound].questions.map(
              ({ question, answers }, ix) => (
                <ScoringQuestion
                  key={`${currentRound}-${ix}`}
                  question={question}
                  responses={answers}
                  updateScore={updateScore}
                  currentScore={currentScore}
                />
              )
            )}
          </div>
        </div>
        <div>
          {currentRound < answers[currentParticipant].rounds.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentRound(currentRound + 1)}
            >
              Next Round
            </button>
          ) : null}
          {currentRound > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentRound(currentRound - 1)}
            >
              Previous Round
            </button>
          ) : null}
          {currentRound === answers[currentParticipant].rounds.length - 1 &&
          currentParticipant <= answers.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                const totalScore = Object.values(currentScore).reduce(
                  (c, v) => c + v,
                  0
                );
                submitParticipantScore(
                  answers[currentParticipant].participantId,
                  answers[currentParticipant].displayName,
                  totalScore
                );
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
      <h3>{error ? error : 'Loading...'}</h3>
    </div>
  );
}

function ScoringQuestion({ question, responses, updateScore, currentScore }) {
  return (
    <div>
      <h4>{question}</h4>
      {responses.map(({ answer, answerId, points, response }) => (
        <ScoringAnswer
          answer={answer}
          answerId={answerId}
          points={points}
          response={response}
          updateScore={updateScore}
          currentScore={currentScore[answerId]}
          key={answerId}
        />
      ))}
    </div>
  );
}

function ScoringAnswer({
  answer,
  answerId,
  points,
  response,
  updateScore,
  currentScore
}) {
  const [score, setScore] = useState(currentScore || 0);
  return (
    <div>
      <div>
        <label htmlFor={`answer-${answerId}`}>Answer:</label>
        <input disabled type="text" value={answer} id={`answer-${answerId}`} />
      </div>
      <div>
        <label htmlFor={`response-${answerId}`}>Their Response:</label>
        <input
          disabled
          type="text"
          value={response}
          id={`response-${answerId}`}
        />
      </div>
      <div>
        <label htmlFor={`points-${answerId}`}>Points:</label>
        <input
          type="number"
          placeholder={score}
          id={`points-${answerId}`}
          onChange={(e) => {
            const v = e.target.value;
            setScore(v);
            updateScore(answerId, v);
          }}
        />
        <label htmlFor={`answerPoints-${answerId}`}>
          Points for a correct answer:
        </label>
        <input
          disabled
          type="number"
          value={points}
          id={`answerPoints-${answerId}`}
        />
      </div>
    </div>
  );
}

function fmtAnswers(playerIds, responses) {
  if (!responses) {
    return [];
  }
  return _.zip(playerIds, responses).map(
    ([
      pid,
      {
        game: {
          quiz: { quizRound }
        },
        player: { displayName },
        responses
      }
    ]) => ({
      participantId: pid,
      displayName,
      rounds: quizRound.map(({ questions, roundNo }) => ({
        roundNo,
        questions: questions.map(({ question, answers }) => ({
          question,
          answers: answers.map(({ answer, answerId, points }) => ({
            answer,
            answerId,
            points,
            response: _.find(responses, (r) => r.answerId).response
          }))
        }))
      }))
    })
  );
}

function doSort(ps) {
  if (!ps.length) {
    return [];
  } else {
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
}
