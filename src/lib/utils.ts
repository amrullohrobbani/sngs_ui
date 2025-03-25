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