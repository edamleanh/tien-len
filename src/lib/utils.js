export const POINTS = {
  TARGET: [3, 2, 1, 0],
  ZERO_SUM: [2, 1, -1, -2]
};

export function calculateRoundScores(mode, rankings) {
  // rankings: [p1, p2, p3, p4] (names in order of 1st..4th)
  // returns: { p1: score, p2: score... }
  
  const scores = {};
  const points = POINTS[mode] || POINTS.TARGET;
  
  rankings.forEach((player, index) => {
    if (player) {
      scores[player] = points[index];
    }
  });
  
  return scores;
}
