/**
 * Type-Safe CSS Scoring Engine.
 */

export interface CSSMetrics {
  width: string;
  height: string;
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  border: string;
}

export function scoreCSS(player: Partial<CSSMetrics>, target: CSSMetrics): number {
  if (!player || !target) return 0;

  let totalScore = 0;
  let possibleScore = 0;

  // 1. Dimensions (40 pts)
  const pWidth = parseFloat(player.width || '0');
  const tWidth = parseFloat(target.width);
  const pHeight = parseFloat(player.height || '0');
  const tHeight = parseFloat(target.height);

  const widthScore = calculateProportionalScore(pWidth, tWidth, 100, 20);
  const heightScore = calculateProportionalScore(pHeight, tHeight, 100, 20);
  totalScore += widthScore + heightScore;
  possibleScore += 40;

  // 2. Background Color (30 pts)
  const colorScore = calculateColorScore(player.backgroundColor || 'rgb(0,0,0)', target.backgroundColor);
  totalScore += colorScore * 30;
  possibleScore += 30;

  // 3. Border Radius (20 pts)
  const pRadius = parseFloat(player.borderRadius || '0');
  const tRadius = parseFloat(target.borderRadius || '0');
  const radiusScore = calculateProportionalScore(pRadius, tRadius, 50, 20);
  totalScore += radiusScore;
  possibleScore += 20;

  // 4. Box Shadow & Border (10 pts)
  if (target.boxShadow && target.boxShadow !== 'none') {
    if (player.boxShadow && player.boxShadow !== 'none') {
      totalScore += 5;
    }
    possibleScore += 5;
  }

  if (target.border && target.border !== 'none') {
    if (player.border && player.border !== 'none' && player.border !== '0px none rgb(0, 0, 0)') {
      totalScore += 5;
    }
    possibleScore += 5;
  }

  return Math.min(Math.round((totalScore / possibleScore) * 100), 100);
}

function calculateProportionalScore(val: number, target: number, maxDiff: number, weight: number): number {
  const diff = Math.abs(val - target);
  if (diff > maxDiff) return 0;
  return (1 - diff / maxDiff) * weight;
}

function calculateColorScore(c1: string, c2: string): number {
  const parse = (c: string): number[] => {
    if (c.startsWith('#')) {
      const hex = c.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16)
        ];
      }
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ];
    }
    const match = c.match(/\d+/g);
    return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
  };
  const rgb1 = parse(c1);
  const rgb2 = parse(c2);
  
  const diff = rgb1.reduce((acc, val, i) => acc + Math.abs(val - (rgb2[i] || 0)), 0);
  const maxDiff = 255 * 3;
  return Math.max(0, 1 - diff / (maxDiff * 0.2)); // 20% total diff is 0 score
}
