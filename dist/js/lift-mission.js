// Moves the mission card of a laboratory mounted inside a figure frame (an exhibit of the Musée, the figure beside a
// reading) into a slot of the reading column, so the frame kept in view holds only the figure and its controls. The card
// keeps its listeners (the node is moved, not copied). Returns the function that stops watching.
export function liftMission(stage, slot) {
  if (!stage || !slot) return () => {};
  const move = () => {
    const card = stage.querySelector('.lab2-card');
    if (!card) return false;
    slot.append(card); slot.hidden = false;
    return true;
  };
  if (move()) return () => {};
  const watch = new MutationObserver(() => { if (move()) watch.disconnect(); });
  watch.observe(stage, { childList: true, subtree: true });
  return () => watch.disconnect();
}
