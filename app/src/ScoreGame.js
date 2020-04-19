import React, { useEffect, useState } from 'react';
import { getParticipantAnswers, submitScore } from 'db/game';

export default function ScoreGame({ game }) {
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [currentParticipant, setCurrentParticipant] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentScore, setCurrentScore] = useState({});
  const [participantScores, setParticipantScores] = useState([]);

  function fmtAnswers(ans) {
    const participants = [];
    let resps = [];
    let currentQ;
    let as = [];
    for (let {
      player: { displayName },
      participantId,
      responses,
    } of ans) {
      for (let {
        answer: {
          answerId,
          answer,
          points,
          question: {
            question,
            questionId,
            round: { roundNo },
          },
        },
        response,
      } of responses) {
        if (!currentQ) {
          currentQ = { questionId, question, roundNo };
          as = [{ answer, answerId, points, response }];
        } else if (currentQ.questionId === questionId) {
          as.push({ answer, answerId, points, response });
        } else {
          resps.push({ question: currentQ, responses: as });
          currentQ = { questionId, question, roundNo };
          as = [{ answer, answerId, points, response }];
        }
      }
      resps.push({ question: currentQ, responses: as });
      participants.push({ displayName, participantId, responses: resps });
      resps = [];
      currentQ = null;
    }
    return participants;
  }

  function getResponses() {
    getParticipantAnswers(game)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error(
            "There was a problem retrieving participants' answers.",
          );
        }
      })
      .then((ans) => {
        setAnswers(fmtAnswers(ans));
      })
      .catch((e) => setError(e));
  }

  function submitParticipantScore(participantId, displayName, score) {
    submitScore(participantId, score)
      .then((resp) => {
        if (resp.ok) {
          const ps = participantScores;
          ps.push({ id: participantId, score, displayName });
          setParticipantScores(ps);
          setCurrentParticipant(currentParticipant + 1);
        } else {
          throw new Error('There was an error submitting the score.');
        }
      })
      .catch((e) => setError(e));
  }

  useEffect(getResponses, [answers]);

  function Scoring() {
    return (
      <div>
        {error ? <div>{error}</div> : null}
        <div>
          <h2>Team: {answers[currentParticipant].displayName}</h2>
          <h3>Round {currentRound + 1}</h3>
          <div>
            {answers[currentParticipant].responses[currentRound].map(
              ({ question: { question }, responses }) => {
                return (
                  <div>
                    <h4>{question}</h4>
                    {responses.map(({ answer, answerId, points, response }) => {
                      return (
                        <div>
                          <div>
                            <h5>Answer</h5>
                            <p>{answer}</p>
                            <input
                              type="number"
                              disabled="true"
                              value={points}
                            />
                          </div>
                          <div>
                            <h5>Their Answer</h5>
                            <p>{response}</p>
                            <input
                              type="number"
                              placeholder="0"
                              onChange={(e) => {
                                let cs = currentScore;
                                cs[answerId] = e.target.value;
                                setCurrentScore(cs);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              },
            )}
          </div>
        </div>
        <div>
          {currentRound < answers[currentParticipant].responses.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentRound(currentRound + 1)}>
              Next Round
            </button>
          ) : null}
          {currentRound > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentRound(currentRound - 1)}>
              Previous Round
            </button>
          ) : null}
          {currentRound === answers[currentParticipant].responses.length - 1 &&
          currentParticipant < answers.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                const totalScore = Object.values(currentScore).reduce(
                  (c, v) => c + v,
                  0,
                );
                submitParticipantScore(
                  answers[currentParticipant].participantId,
                  answers[currentParticipant].displayName,
                  totalScore,
                );
              }}>
              Submit Score
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function Results() {
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
  if (answers) {
    if (currentParticipant < answers.length) {
      return Scoring();
    } else {
      return Results();
    }
  }
}
