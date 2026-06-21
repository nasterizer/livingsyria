export function imageUrl(objectPath: string | null | undefined): string | null {
  if (!objectPath) return null;
  if (objectPath.startsWith("http://") || objectPath.startsWith("https://")) {
    return objectPath;
  }
  if (objectPath.startsWith("/")) {
    return `/api${objectPath}`;
  }
  return `/api/${objectPath}`;
}

const PALETTES: Array<[string, string, string]> = [
  ["#E8C8A8", "#C76E47", "#7A2E1A"],
  ["#F0D9B5", "#B07050", "#5B2A1B"],
  ["#D9C9A8", "#7A8C7C", "#2F4A3A"],
  ["#E5CFC0", "#A85A4A", "#3A1F18"],
  ["#EAD7BB", "#C9985E", "#5C3A1B"],
  ["#D7DCE0", "#5C7A8C", "#1F3A4A"],
  ["#EAD3D9", "#A85A6E", "#3A1F2A"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function gradientFor(seed: string): { bg: string; fg: string; mid: string } {
  const p = PALETTES[hash(seed) % PALETTES.length];
  if (!p) return { bg: "", mid: "", fg: "" };
  return { bg: p[0], mid: p[1], fg: p[2] };
}

export function monogramFor(text: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return "L";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("").toUpperCase();
}
