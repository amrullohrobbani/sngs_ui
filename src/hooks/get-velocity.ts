import { DataItem as VelocityData } from "@/context/DataContext";
   
  // Remove existing velocity data from the team array
  function removePlayerVelocities(team: VelocityData[]): VelocityData[] {
      return team.map((entry) => {
          const { vx, vy, speed, ...cleanedEntry } = entry; // Remove vx, vy, speed (and others if added like ax, ay)
          return cleanedEntry as VelocityData;
      });
  }
  
  // Savitzky-Golay filter implementation (simplified for linear polynomial, polyorder=1)
  function savitzkyGolayFilter(data: (number | undefined)[], window: number, polyorder: number = 1): (number | undefined)[] {
    if (window % 2 === 0 || window < 3) throw new Error("Window size must be an odd number >= 3");
    if (polyorder >= window) throw new Error("Polynomial order must be less than window size");
  
    const halfWindow = Math.floor(window / 2);
    const result: (number | undefined)[] = [];
  
    // For polyorder=1, we fit a linear polynomial (y = a + bx) and take the derivative (b) as velocity
    for (let i = 0; i < data.length; i++) {
      if (data[i] === undefined) {
        result.push(undefined);
        continue;
      }
  
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);
      const windowData = data.slice(start, end).map((v, idx) => ({
        x: idx - (end - start - 1) / 2, // Center x around 0
        y: v,
      }));
  
      // Linear regression for y = a + bx
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, count = 0;
      for (const { x, y } of windowData) {
        if (y !== undefined) {
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumXX += x * x;
          count++;
        }
      }
  
      if (count < polyorder + 1) {
        result.push(undefined); // Not enough points to fit
      } else {
        const denominator = count * sumXX - sumX * sumX;
        const slope = (count * sumXY - sumX * sumY) / denominator; // b (derivative)
        result.push(slope);
      }
    }
  
    return result;
  }
  
  // Moving average filter
  function movingAverage(data: (number | undefined)[], window: number): (number | undefined)[] {
    const result: (number | undefined)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] === undefined) {
        result.push(undefined);
        continue;
      }
  
      let sum = 0;
      let count = 0;
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.ceil(window / 2));
      for (let j = start; j < end; j++) {
        if (data[j] !== undefined) {
          sum += data[j]!;
          count++;
        }
      }
      result.push(count > 0 ? sum / count : undefined);
    }
    return result;
  }
  
  // Main function to calculate player velocities
  export async function calcPlayerVelocities(
    teamData: VelocityData[],
    smoothing: boolean = true,
    filter: 'Savitzky-Golay' | 'moving average' = 'Savitzky-Golay',
    window: number = 7,
    polyorder: number = 1,
    maxSpeed: number = 12
  ): Promise<VelocityData[]> {
    // Remove any existing velocity data
    const team = removePlayerVelocities(teamData);
  
    // Get unique player IDs (tracklet_id)
    const playerIds = [...new Set(team.map((entry) => entry.tracklet_id))];
  
    // Frame rate is 25 fps, so timestep (dt) is 1/25 = 0.04 seconds
    const dt = 0.04;
  
    // Group data by player for easier processing
    const playerDataMap: { [key: number]: VelocityData[] } = {};
    playerIds.forEach((id) => {
      playerDataMap[id] = team.filter((entry) => entry.tracklet_id === id).sort((a, b) => a.frame - b.frame);
    });
  
    // Estimate velocities for each player
    playerIds.forEach((playerId) => {
      const playerData = playerDataMap[playerId];
  
      // Calculate raw velocities (difference in position / time)
      const vx: (number | undefined)[] = [undefined]; // First frame has no velocity
      const vy: (number | undefined)[] = [undefined];
      for (let i = 1; i < playerData.length; i++) {
        const dx = playerData[i].x_pitch - playerData[i - 1].x_pitch;
        const dy = playerData[i].y_pitch - playerData[i - 1].y_pitch;
        const frameDiff = playerData[i].frame - playerData[i - 1].frame;
        if (frameDiff === 1) { // Ensure consecutive frames
          vx.push(dx / dt);
          vy.push(dy / dt);
        } else {
          vx.push(0); // Gap in frames, no velocity
          vy.push(0);
        }
      }
  
      // Apply max speed filter
      if (maxSpeed > 0) {
        for (let i = 0; i < vx.length; i++) {
          if (vx[i] !== undefined && vy[i] !== undefined) {
            const rawSpeed = Math.sqrt(vx[i]! * vx[i]! + vy[i]! * vy[i]!);
            if (rawSpeed > maxSpeed) {
              vx[i] = 0;
              vy[i] = 0;
            }
          }
        }
      }
  
      // Apply smoothing if enabled
      if (smoothing) {
        console.log(filter)
        if (filter === 'Savitzky-Golay') {
          const smoothedVx = savitzkyGolayFilter(vx, window, polyorder);
          const smoothedVy = savitzkyGolayFilter(vy, window, polyorder);
          for (let i = 0; i < playerData.length; i++) {
            vx[i] = smoothedVx[i];
            vy[i] = smoothedVy[i];
          }
        } else if (filter === 'moving average') {
          const smoothedVx = movingAverage(vx, window);
          const smoothedVy = movingAverage(vy, window);
          for (let i = 0; i < playerData.length; i++) {
            vx[i] = smoothedVx[i];
            vy[i] = smoothedVy[i];
          }
        }
      }
      
      // Assign velocities back to player data
      for (let i = 0; i < playerData.length; i++) {
        playerData[i].vx = vx[i];
        playerData[i].vy = vy[i];
        if (vx[i] !== undefined && vy[i] !== undefined) {
          playerData[i].speed = Math.sqrt(vx[i]! * vx[i]! + vy[i]! * vy[i]!);
        }
      }
    });
  
    // Reconstruct the team array with updated velocities
    return team.map((entry) => {
      const playerData = playerDataMap[entry.tracklet_id].find((d) => d.frame === entry.frame);
      return {
        ...entry,
        vx: playerData?.vx,
        vy: playerData?.vy,
        speed: playerData?.speed,
      };
    });
  }
