// Lab references resolved without the laboratory's code, against the generated catalogue lines (catalogue-lines.js), for
// the pages that only name or link an experiment (chapter pages, Olympiad).
import { EXPERIMENT_LINES } from "../catalogue-lines.js";
import { parseRef } from "./refs.js";

// Same answer as registry.js resolveRef, with the line of the experiment ({ id, title, short, missions: [ids] }) and the
// mission's id: { line, mission, index, ref, explicit } or null.
export function resolveLine(ref) {
  if (typeof ref !== "string") return null;
  const { id, mission } = parseRef(ref);
  const line = EXPERIMENT_LINES.find((e) => e.id === id);
  if (!line || ref.split("/").length > 2) return null;
  const index = mission ? line.missions.indexOf(mission) : 0;
  if (index < 0) return null;
  return { line, mission: line.missions[index], index, ref: `${line.id}/${line.missions[index]}`, explicit: !!mission };
}
