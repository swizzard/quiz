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
        {questions.map(({ question }, ix) => (
          <HostQuestion key={`question-${roundNo}-${ix}`} question={question} ix={ix} />
        ))}
      </div>
    );
  }

  function HostQuestion({ question, ix }) {
    return (
      <div>
        <p>
          <b>{`${ix + 1}.`}</b>
          {`${question}`}
        </p>
      </div>
    );
  }

  function CopyCodeButton({ code }) {
    const [copied, setCopied] = useState(false);
    const [err, setErr] = useState(false);
    const copyCode = () =>
      navigator.clipboard
        .writeText(code)
        .then(() => setCopied(true))
        .catch(() => setErr(true));
    return (
      <div>
        <h4>Code: {code}</h4>
        <p>Send this code to your players so they can join the game!</p>
        {!copied && !err ? (
          <button type="button" onClick={copyCode}>
            Copy
          </button>
        ) : copied ? (
          <span class="small">Copied!</span>
        ) : (
          <span>An error occurred&mdash;please copy the code manually.</span>
        )}
      </div>
    );
  }

  if (score) {
    return <ScoreGame code={game.code} />;
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
          <CopyCodeButton code={game.code} />
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
