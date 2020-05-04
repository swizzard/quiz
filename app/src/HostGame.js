import React, { useEffect, useState } from "react";
import { createHostedGame, getParticipants } from "./db/game";
import ScoreGame from "./ScoreGame";

export default function HostGame({ game, user }) {
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRound, setMaxRound] = useState(0);
  const [score, setScore] = useState(false);

  useEffect(() => {
    createHostedGame(user.id, game.quizId)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error("There was a problem starting your game");
        }
      })
      .then((code) => {
        game.code = code;
        setCurrentGame(game);
        setMaxRound(game.quizRounds.length - 1);
      })
      .catch((e) => setError(e.message));
  }, [game, user.id]);

  function updateParticipants() {
    setError(null);
    getParticipants(currentGame.code)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error(resp.statusText);
        }
      })
      .then(({ participants }) => {
        setParticipants(participants);
      })
      .catch((e) => setError(e.message));
  }

  function Round({ roundNo, questions }) {
    return (
      <div>
        <h5>Round: {roundNo + 1}</h5>
        {questions.map(({ question }) => (
          <HostQuestion question={question} />
        ))}
      </div>
    );
  }

  function HostQuestion({ question }) {
    return (
      <div>
        <h5>{question}</h5>
      </div>
    );
  }

  if (score) {
    return <ScoreGame game={game} user={user} />;
  } else if (!game) {
    return (
      <div>
        <div>{error ? error : "Loading..."}</div>
      </div>
    );
  } else {
    return (
      <div>
        {error ? <div>{error}</div> : null}
        <div>
          <h3>{game.quizName}</h3>
          <h4>Code: {game.code}</h4>
        </div>
        <div>
          <h4>Participants</h4>
          <ul>{participants.length ? participants.map(({ player: { displayName } }) => <li>{displayName}</li>) : null}</ul>
          <button type="button" onClick={() => updateParticipants()}>
            Refresh Participants
          </button>
        </div>
        <Round key={`game-${game.quizId}-round-${currentRound}`} roundNo={currentRound} questions={game.quizRounds[currentRound].questions} />
        {currentRound < maxRound ? (
          <button type="button" onClick={() => setCurrentRound(currentRound + 1)}>
            Next Round
          </button>
        ) : null}
        {currentRound > 0 ? (
          <button type="button" onClick={() => setCurrentRound(currentRound - 1)}>
            Previous Round
          </button>
        ) : null}
        {currentRound === maxRound ? (
          <button type="button" onClick={() => setScore(true)}>
            Score Game
          </button>
        ) : null}
      </div>
    );
  }
}
