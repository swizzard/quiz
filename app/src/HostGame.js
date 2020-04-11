import React, { useEffect, useState } from 'react';
import { newGame } from 'db/game';


export default function HostGame(game, user) {
  const [error, setError] = useState([]);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    createHostedGame(game.id, user.id)
