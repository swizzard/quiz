import React, { useEffect, useState } from 'react';
import { createHostedGame, getParticipants } from 'db/game';
import ScoreGame from './ScoreGame';

export default function HostGame({ game, user }) {
  const [error, setError] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRound, setMaxRound] = useState(0);
  const [score, setScore] = useState(false);

  useEffect(() => {
    createHostedGame(user.id, game.id)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error('There was a problem starting your game');
        }
      })
      .then((code) => {
        game.code = code;
        setCurrentGame(game);
        setMaxRound(game.quiz.quiz_round.length);
      })
      .catch((e) => setError(e));
  }, [currentGame]);

  function updateParticipants() {
    setError(null);
    getParticipants(currentGame.code)
      .then((ps) => setParticipants(ps))
      .catch((e) => setError(e));
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
        <div>{error ? error : 'Loading...'}</div>
      </div>
    );
  } else {
    return (
      <div>
        {error ? <div>{error}</div> : null}
        <div>
          <h3>{game.quiz.name}</h3>
          <h4>Code: {game.code}</h4>
        </div>
        <div>
          <h4>Participants</h4>
          <ul>
            {participants.map(({ player: { display_name } }) => (
              <li>{display_name}</li>
            ))}
          </ul>
          <button type="button" onClick={() => updateParticipants()}>
            Refresh Participants
          </button>
        </div>
        <Round
          roundNo={currentRound + 1}
          questions={game.quiz.quiz_round[currentRound]}
        />
        {currentRound >= maxRound ? null : (
          <button
            type="button"
            onClick={() => setCurrentRound(currentRound + 1)}>
            Next Round
          </button>
        )}
        {currentRound <= 0 ? null : (
          <button
            type="button"
            onClick={() => setCurrentRound(currentRound - 1)}>
            Previous Round
          </button>
        )}
        {currentRound < maxRound ? null : (
          <button type="button" onClick={() => setScore(true)}>
            Score Game
          </button>
        )}
      </div>
    );
  }
}
