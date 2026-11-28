// The form of a lab reference: "quadratic" or "quadratic/vertex". One parser for registry.js (which resolves a reference to
// the experiment itself) and lines.js (which resolves it to the experiment's catalogue line, without its code).
// "quadratic" or "quadratic/vertex" -> { id, mission }
export function parseRef(ref) {
  const [id, mission] = String(ref || "").split("/");
  return { id, mission: mission || null };
}
export const labRef = (id, mission) => (mission ? `${id}/${mission}` : id);
