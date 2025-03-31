import { DataItem } from "@/context/DataContext";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const teamLabel = [
  {label:"Team Left", value: 1},
  {label:"Team Right", value: 0},
  {label:"Non - Player", value: -1} 
]

export function getPreviousElements<T>(arr: T[], currentIndex: number, n: number): T[] {
  // If n is 0, return the entire array
  if (n === 0) {
    return arr;
  } else {
    // Get the last n elements before the current index
    const startIndex = Math.max(0, currentIndex - n);  // Ensures we do not go below index 0
    return arr.slice(startIndex, currentIndex);  // Returns the elements before the current index
  }
}

export function analyzeTeamTendencies(players: DataItem[]) {
  // Step 1: Group players by team
  const groupedByTeam = players.reduce((acc: { left: number[]; right: number[] }, player) => {
    if (player.team === 1 || player.team === 0) {
      const teamKey = player.team === 1 ? "left" : "right";
      if (player.vx !== undefined) {
        acc[teamKey].push(player.vx);
      }
    }
    return acc;
  }, { left: [], right: [] });

  // Step 2: Calculate the average vx for each team
  const calculateAverageVx = (vxValues: number[]) => {
    const totalVx = vxValues.reduce((sum, vx) => sum + vx, 0);
    return totalVx / vxValues.length;
  };

  const leftTeamAverageVx = calculateAverageVx(groupedByTeam.left);
  const rightTeamAverageVx = calculateAverageVx(groupedByTeam.right);

  // Step 3: Determine which team is actually moving left or right
  const leftTeamTendency = leftTeamAverageVx > 0 ? "right" : "left";
  const rightTeamTendency = rightTeamAverageVx > 0 ? "right" : "left";

  // Step 4: Determine the actual "left" and "right" team based on tendencies
  const actualLeftTeam = leftTeamAverageVx > rightTeamAverageVx ? "left" : "right";
  const actualRightTeam = actualLeftTeam === "left" ? "right" : "left";

  return {
    leftTeamAverageVx,
    rightTeamAverageVx,
    leftTeamTendency,
    rightTeamTendency,
    actualLeftTeam,
    actualRightTeam
  };
}

export function getMostFrequentColorByTeam(data: DataItem[]): { left: string, right: string } {
  const colorCount = {
    left: {} as Record<string, number>,
    right: {} as Record<string, number>
  };

  // Loop through each prediction and count the colors based on team
  data.forEach((prediction) => {
    const { team, color } = prediction;
    if (team === 1 || team === 0) {
      const teamKey = team === 1 ? "left" : "right";
      if (color) {
        if (!colorCount[teamKey][color]) {
          colorCount[teamKey][color] = 0;
        }
        colorCount[teamKey][color]++;
      }
    }
  });

  // Function to find the most frequent color
  const getMostFrequentColor = (team: "left" | "right") => {
    let mostFrequentColor = "";
    let maxCount = 0;
    
    Object.entries(colorCount[team]).forEach(([color, count]) => {
      if (count > maxCount) {
        mostFrequentColor = color;
        maxCount = count;
      }
    });
    
    return mostFrequentColor;
  };

  return {
    left: getMostFrequentColor("left"),
    right: getMostFrequentColor("right")
  };
}

interface AccuracyResults {
  frameAccuracies: { [frame: string]: number };
  overallAccuracy: number;
  overallWrong: number;
  matchingMetrics: {
    [frame: string]: {
      accuracy: number;
      confusionMatrix: { TP: number; TN: number; FP: number; FN: number };
    };
  };
}

export function computeTeamAccuracy(
  gtArray: DataItem[],
  predArray: DataItem[]
): AccuracyResults {
  // Filter objects with role "player" (case-insensitive)
  const gtPlayers = gtArray.filter(
    (item) => item.role.toLowerCase() === "player"
  );
  const predPlayers = predArray.filter(
    (item) => item.role.toLowerCase() === "player"
  );

  // Helper function to group items by frame (as a string)
  function groupByFrame(arr: DataItem[]): { [frame: string]: DataItem[] } {
    return arr.reduce((acc: { [frame: string]: DataItem[] }, item) => {
      const frame = String(item.frame);
      if (!acc[frame]) {
        acc[frame] = [];
      }
      acc[frame].push(item);
      return acc;
    }, {});
  }

  // Helper function to compute Euclidean distance using x_pitch and y_pitch.
  function computeDistance(item1: DataItem, item2: DataItem): number {
    const dx = item1.x - item2.x;
    const dy = item1.y - item2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const gtByFrame = groupByFrame(gtPlayers);
  const predByFrame = groupByFrame(predPlayers);

  let totalCorrect = 0;
  let totalPlayers = 0;
  const frameAccuracies: { [frame: string]: number } = {};

  // This object will store, for each frame, the matching-based accuracy and confusion matrix.
  const matchingMetrics: {
    [frame: string]: {
      accuracy: number;
      confusionMatrix: { TP: number; TN: number; FP: number; FN: number };
    };
  } = {};

  // Get all frames that appear in either ground truth or predictions.
  const frames = new Set([
    ...Object.keys(gtByFrame),
    ...Object.keys(predByFrame),
  ]);

  frames.forEach((frame) => {
    const gtFramePlayers = gtByFrame[frame] || [];
    const predFramePlayers = predByFrame[frame] || [];

    // --- Existing approach: count players per team ---
    const gtCount: { [team: string]: number } = { "0": 0, "1": 0 };
    gtFramePlayers.forEach((item) => {
      const team = String(item.team);
      gtCount[team] = (gtCount[team] || 0) + 1;
    });

    const predCount: { [team: string]: number } = { "0": 0, "1": 0 };
    predFramePlayers.forEach((item) => {
      const team = String(item.team);
      predCount[team] = (predCount[team] || 0) + 1;
    });

    // For each team, the correct prediction count is the minimum of gt and pred counts.
    const correctTeam0 = Math.min(gtCount["0"], predCount["0"]);
    const correctTeam1 = Math.min(gtCount["1"], predCount["1"]);
    const correctCount = correctTeam0 + correctTeam1;

    // Use the total number of ground truth players as the reference.
    const totalCount = gtFramePlayers.length;
    const frameAccuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    frameAccuracies[frame] = frameAccuracy;

    totalCorrect += correctCount;
    totalPlayers += totalCount;

    // --- New approach: Matching-based metrics ---
    // Greedy matching: for each frame, match predicted players to gt players based on the closest x_pitch/y_pitch.
    const gtRemaining = [...gtFramePlayers];
    const predRemaining = [...predFramePlayers];
    const matches: Array<{ gt: DataItem; pred: DataItem }> = [];
    while (gtRemaining.length > 0 && predRemaining.length > 0) {
      let bestDistance = Infinity;
      let bestGtIndex = -1;
      let bestPredIndex = -1;
      for (let i = 0; i < gtRemaining.length; i++) {
        for (let j = 0; j < predRemaining.length; j++) {
          const distance = computeDistance(gtRemaining[i], predRemaining[j]);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestGtIndex = i;
            bestPredIndex = j;
          }
        }
      }
      if (bestGtIndex >= 0 && bestPredIndex >= 0) {
        matches.push({ gt: gtRemaining[bestGtIndex], pred: predRemaining[bestPredIndex] });
        // Remove the matched items to avoid multiple assignments.
        gtRemaining.splice(bestGtIndex, 1);
        predRemaining.splice(bestPredIndex, 1);
      } else {
        break;
      }
    }

    // Build a confusion matrix from the matched pairs.
    // We treat team "1" as the positive class and team "0" as the negative class.
    let TP = 0, TN = 0, FP = 0, FN = 0;
    matches.forEach((match) => {
      const actualTeam = String(match.gt.team);
      const predictedTeam = String(match.pred.team);
      if (actualTeam === "1" && predictedTeam === "1") {
        TP++;
      } else if (actualTeam === "0" && predictedTeam === "0") {
        TN++;
      } else if (actualTeam === "0" && predictedTeam === "1") {
        FP++;
      } else if (actualTeam === "1" && predictedTeam === "0") {
        FN++;
      }
    });
    const totalMatches = matches.length;
    const matchingAccuracy = totalMatches > 0 ? ((TP + TN) / totalMatches) * 100 : 0;

    matchingMetrics[frame] = {
      accuracy: matchingAccuracy,
      confusionMatrix: { TP, TN, FP, FN },
    };
  });

  // Calculate overall accuracy and wrong percentage.
  const overallAccuracy = totalPlayers > 0 ? (totalCorrect / totalPlayers) * 100 : 0;
  const overallWrong = 100 - overallAccuracy;

  return {
    frameAccuracies,
    overallAccuracy,
    overallWrong,
    matchingMetrics, // New return value: per-frame matching accuracy & confusion matrix.
  };
}
