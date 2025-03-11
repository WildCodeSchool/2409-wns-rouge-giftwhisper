function getRandomPair(players: string[]) {
  const availablePlayers = structuredClone(players);
  const pairs: Record<string, string> = {};
  players.forEach((player, i) => {
    // Deal with last pair //
    if (i === players.length - 2) {
      const lastPlayer = players[i + 1];
      if (availablePlayers.includes(lastPlayer)) {
        pairs[player] = lastPlayer;
        const finalPlayer = availablePlayers.find((p) => p !== lastPlayer);
        if (!finalPlayer) throw new Error('There was an issue during the raffle, try again');
        pairs[lastPlayer] = finalPlayer;
        return;
      }
    }
    ///////////////////////////////////////////////////
    // Avoid player getting paired with themself //
    const isCurrentPlayerInPool = availablePlayers.includes(player);
    if (isCurrentPlayerInPool) {
      const currentPlayerIndex = availablePlayers.findIndex(
        (availablePlayer) => {
          return player === availablePlayer;
        }
      );
      availablePlayers.splice(currentPlayerIndex, 1);
    }
    ///////////////////////////////////////////////////
    // Avoid pair reciprocity //
    let attributedReceiver = "";
    for (const [key, value] of Object.entries(pairs)) {
      if (value === player) {
        const index = availablePlayers.findIndex((p) => p === key);
        if (index >= 0) {
          attributedReceiver = key;
          availablePlayers.splice(index, 1);
        }
      }
    }
    ///////////////////////////////////////////////////
    const randomNumber = Math.floor(Math.random() * availablePlayers.length);
    pairs[player] = availablePlayers[randomNumber];
    availablePlayers.splice(randomNumber, 1);
    if (attributedReceiver) availablePlayers.push(attributedReceiver);
    if (isCurrentPlayerInPool) availablePlayers.push(player);
  });
  return pairs;
}