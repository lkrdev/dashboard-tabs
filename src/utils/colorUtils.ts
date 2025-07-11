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

// Convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
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

/**
 * Make a color lighter if it's dark, or darker if it's light.
 * @param color - The hex color string (e.g. "#aabbcc")
 * @param amount - The amount to lighten/darken (0-1, default 0.2)
 * @returns The adjusted hex color string
 */
export const adjustColorLightness = (
  color: string,
  amount: number = 0.2
): string => {
  let [r, g, b] = hexToRgb(color);
  const luminance = getLuminance(r, g, b);

  if (luminance > 0.5) {
    // Color is light, make it darker
    r = Math.round(r * (1 - amount));
    g = Math.round(g * (1 - amount));
    b = Math.round(b * (1 - amount));
  } else {
    // Color is dark, make it lighter
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
  }

  // Clamp values to [0,255]
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return rgbToHex(r, g, b);
};
