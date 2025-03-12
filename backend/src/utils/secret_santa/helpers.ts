export function getRandomPairs(players: string[]) {
  const shuffleArray = (players: string[]) => {
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    return players;
  }

  const randomNames = shuffleArray(players);
  const matches = randomNames.map((name, index) => {
    return {
      gifter: name,
      receiver: randomNames[index + 1] || randomNames[0],
    }
  });
  return matches;
}