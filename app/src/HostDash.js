import React, { useEffect, useState } from 'react';
import HostGame from './HostGame';
import { getHostGames } from './db/games';

function countQuestions(game) {
  let numQs = 0;
  game.rounds.forEach((r) => (numQs += r.questions.length));
  return numQs;
}

function HostSummary({ game, selectGame }) {
  return (
    <div>
      <h3>{game.name}</h3>
      <p>Rounds: {game.rounds.length}</p>
      <p>Questions: {countQuestions(game)}</p>
      <p>Code: {game.code}</p>
      <button onClick={() => selectGame(game)}>Start!</button>
    </div>
  );
}

export default function HostDash({ setDashState, user }) {
  const [error, setError] = useState(null);
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    getHostGames(user.id)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw new Error('There was a problem retrieving your games');
        }
      })
      .then((games) => setGames(games))
      .catch((e) => setError(e));
  }, [games]);

  return selectedGame ? (
    <HostGame game={selectedGame} user={user} />
  ) : (
    <div>
      {games.map((g) => (
        <HostSummary game={g} selectGame={setSelectedGame} />
      ))}
    </div>
  );
}
