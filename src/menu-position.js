// Where to put the provider menu (fixed positioning, viewport coordinates).
// Opens below the button unless there is too little room, then above (or the reverse for menuDirection="up").
export function menuPosition(rect, viewport, opensUpward, menuMaxHeight = 420) {
  const gap = 4;
  const width = Math.max(240, rect.width);
  const left = Math.max(8, Math.min(rect.left, viewport.width - width - 8));
  const spaceBelow = viewport.height - rect.bottom - gap - 8;
  const spaceAbove = rect.top - gap - 8;
  const up = opensUpward ? spaceAbove >= 160 || spaceAbove > spaceBelow : spaceBelow < 160 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(120, Math.min(menuMaxHeight, Math.floor(viewport.height * 0.6), up ? spaceAbove : spaceBelow));
  return up
    ? { left, bottom: viewport.height - rect.top + gap, maxHeight, minWidth: width }
    : { left, top: rect.bottom + gap, maxHeight, minWidth: width };
}
