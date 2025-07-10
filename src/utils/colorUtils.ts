/**
 * Color utility functions for contrast calculations
 */

// Convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// Get readable text color (black or white) for a given background
export const getReadableTextColor = (backgroundColor: string): string => {
  const contrastWithBlack = getContrastRatio(backgroundColor, "#000000");
  const contrastWithWhite = getContrastRatio(backgroundColor, "#ffffff");

  return contrastWithBlack > contrastWithWhite ? "#000000" : "#ffffff";
};

// Check if a color is light or dark
export const isLightColor = (color: string): boolean => {
  const [r, g, b] = hexToRgb(color);
  const luminance = getLuminance(r, g, b);
  return luminance > 0.5;
};

// Get text color based on background with fallback
export const getTextColor = (
  backgroundColor: string,
  lightText: string = "#000000",
  darkText: string = "#ffffff"
): string => {
  return isLightColor(backgroundColor) ? lightText : darkText;
};

// WCAG contrast compliance check
export const meetsWCAGContrast = (
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean => {
  const ratio = getContrastRatio(foreground, background);

  const thresholds = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };

  return ratio >= thresholds[level][size];
};
