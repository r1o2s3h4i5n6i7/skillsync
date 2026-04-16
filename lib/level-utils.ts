export function calculateLevelAndProgress(totalXp: number): { 
  level: number, 
  xpRequiredForCurrentLevel: number, 
  totalXpForNextLevel: number,
  progressPercentage: number 
} {
  let level = 1;
  let currentLevelXpRequired = 1000;
  let accumulatedXp = 0;

  while (true) {
    if (totalXp < accumulatedXp + currentLevelXpRequired) {
      const xpIntoCurrentLevel = totalXp - accumulatedXp;
      const progressPercentage = Math.min(100, Math.max(0, Math.round((xpIntoCurrentLevel / currentLevelXpRequired) * 100)));
      
      return { 
        level, 
        xpRequiredForCurrentLevel: accumulatedXp, 
        totalXpForNextLevel: accumulatedXp + currentLevelXpRequired,
        progressPercentage
      };
    }
    
    accumulatedXp += currentLevelXpRequired;
    level++;
    
    // The growth factor starts at 35% for level 2, scaling up by 2.5% each level
    const percentage = 35 + (level - 2) * 2.5; 
    currentLevelXpRequired = Math.round(currentLevelXpRequired * (1 + percentage / 100));
  }
}
