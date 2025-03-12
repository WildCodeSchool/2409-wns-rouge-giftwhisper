import { getRandomPairs } from "../../utils/secret_santa/helpers";

const hasSamePairPlayer = (pairs: { gifter: string, receiver: string }[]) => {
  let samePlayerPair = false;
  for (let i = 0; i < pairs.length; i++) {
    const { gifter, receiver } = pairs[i];
    if (gifter === receiver) samePlayerPair = true;
  };
  return samePlayerPair;
};
const hasPairReciprocity = (pairs: { gifter: string, receiver: string }[]) => {
  let pairReciprocity = false;
  for (let i = 0; i < pairs.length; i++) {
    const { gifter, receiver } = pairs[i];
    for (let j = 0; j < pairs.length; j++) {
      if (i === j) continue;
      if (pairs[j].receiver === gifter && pairs[j].gifter === receiver) pairReciprocity = true;
    }
  };
  return pairReciprocity;
};

describe('getRandomPairs', () => {
  const players = ['Marc A', 'Joe B', 'Naima C', 'Tarek D', 'Claude E', 'Bruno F', 'Jasmine G', 'Xavier H', 'Moussa I', 'Kevin J'];

  // In order to receive deterministic values for the tests, the function option is set as random: false;
  // In this fashion, a player will be paired with the player next to him (i + 1) from the original array of players.
  describe('Testing function with hard values instead of random values', () => {
    //We will use a random number of players for the test
    const randomMaxSize = Math.floor(Math.random() * (players.length - 2) + 3);
    const randomSizedPlayersArray = structuredClone(players.slice(0, randomMaxSize));
    const pairs = getRandomPairs(randomSizedPlayersArray, { random: false });

    test("Each player must me paired", () => {
      expect(pairs.length).toBe(randomMaxSize);
    });

    test("Each player should be paired with the player at i + 1", () => {
      for (let i = 0; i < randomSizedPlayersArray.length; i++) {
        const pair = pairs.find(pair => pair.gifter === randomSizedPlayersArray[i]);
        const receiverIndex = randomSizedPlayersArray.findIndex((p) => p === pair?.receiver);
        //The last player of the array is expected to be paired with the first player of the array
        const expectedIndex = i + 1 < randomSizedPlayersArray.length ? i + 1 : 0;
        expect(receiverIndex).toBe(expectedIndex);
      }
    });

    it("Should prevent user from getting paired with themselves", () => {
      const samePlayerPair = hasSamePairPlayer(pairs);
      expect(samePlayerPair).toBe(false);
    });

    it("Should prevent pair reciprocity", () => {
      const pairReciprocity = hasPairReciprocity(pairs);
      expect(pairReciprocity).toBe(false);
    });
  });

  describe('Testing function with random values', () => {
    //We will use a random number of players for the test
    const randomMaxSize = Math.floor(Math.random() * (players.length - 2) + 3);
    const randomSizedPlayersArray = structuredClone(players.slice(0, randomMaxSize));
    const pairs = getRandomPairs(randomSizedPlayersArray, { random: false });

    test("Each player must me paired", () => {
      expect(pairs.length).toBe(randomMaxSize);
    });

    it("Should prevent user from getting paired with themselves", () => {
      const samePlayerPair = hasSamePairPlayer(pairs);
      expect(samePlayerPair).toBe(false);
    });

    it("Should prevent pair reciprocity", () => {
      const pairReciprocity = hasPairReciprocity(pairs);
      expect(pairReciprocity).toBe(false);
    });
  });

})
