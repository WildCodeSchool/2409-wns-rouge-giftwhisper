
/**
 * @info Function based on the Fisher-States alogrithm, returns unique pairs of strings
 * @param players An array of string representing the firstname and lastnamer of the palyers "John Doe"
 * @param options An object containing options : random
 * @param options.random Shoud be ignored, used for test purposes only, set at true by default  
 * @returns An array of object with a gifter key and a receiver key, {gifter: 'John Doe', receiver: 'Jane Doe'}
*/
export function getRandomPairs(players: string[], options: { random: boolean } = { random: true }) {
  if (players.length < 3) throw new Error('A minimum of 3 users are required in order to start the raffle');
  const checkForDuplicate = (players: string[]) => {
    const sanitizedNames = players.map((player) => player.toLowerCase().replaceAll(' ', ''));
    const nameArrayFromSet = Array.from(new Set(sanitizedNames));
    return sanitizedNames.length !== nameArrayFromSet.length;
  }
  if (checkForDuplicate(players)) throw new Error('Each name has to be unique, use format `firstname lastname`');
  const shuffleArray = (players: string[]) => {
    for (let i = players.length - 1; i > 0; i--) {
      const j = options.random ? Math.floor(Math.random() * (i + 1)) : i - 1;
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