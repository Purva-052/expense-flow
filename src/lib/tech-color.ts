// We keep to max 5 brand colors by bucketing technologies into 5 hues via hashing.
// Returns tailwind classes that map to CSS variables defined in globals.css.
function hashToIndex(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h % 5
}

const palette = [
  { bg: "bg-chart-1/15", text: "text-chart-1", ring: "ring-1 ring-chart-1/30" },
  { bg: "bg-chart-2/15", text: "text-chart-2", ring: "ring-1 ring-chart-2/30" },
  { bg: "bg-chart-3/15", text: "text-chart-3", ring: "ring-1 ring-chart-3/30" },
  { bg: "bg-chart-4/15", text: "text-chart-4", ring: "ring-1 ring-chart-4/30" },
  { bg: "bg-chart-5/15", text: "text-chart-5", ring: "ring-1 ring-chart-5/30" },
]

export function techColorClasses(tech: string) {
  return palette[hashToIndex(tech)]
}
