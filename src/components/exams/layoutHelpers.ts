export const DEFAULT_EXAM_AREA_WIDTH = 320;
export const DEFAULT_EXAM_AREA_HEIGHT = 320;

const getHorizontalBounds = (
  areaWidth: number,
  itemWidth: number,
  sidePadding: number
) => {
  const safeWidth = Math.max(areaWidth, itemWidth + sidePadding * 2);
  const minX = sidePadding;
  const maxX = Math.max(minX, safeWidth - itemWidth - sidePadding);
  return { minX, maxX };
};

export const getRandomHorizontalPosition = (
  areaWidth: number,
  itemWidth: number,
  sidePadding: number
) => {
  const { minX, maxX } = getHorizontalBounds(areaWidth, itemWidth, sidePadding);
  if (maxX <= minX) {
    return (Math.max(areaWidth, itemWidth) - itemWidth) / 2;
  }
  return Math.random() * (maxX - minX) + minX;
};

export const clampHorizontalPosition = (
  value: number,
  areaWidth: number,
  itemWidth: number,
  sidePadding: number
) => {
  const { minX, maxX } = getHorizontalBounds(areaWidth, itemWidth, sidePadding);
  return Math.min(Math.max(value, minX), maxX);
};

export const getVerticalTravelTarget = (
  areaHeight: number,
  itemHeight: number,
  bottomSpacing: number,
  minTarget: number
) => {
  return Math.max(minTarget, areaHeight - itemHeight - bottomSpacing);
};

export const getLaneWidth = (areaWidth: number, laneCount: number) => {
  return Math.max(1, areaWidth / laneCount);
};

export const getLaneItemX = (
  areaWidth: number,
  laneCount: number,
  laneIndex: number,
  itemWidth: number
) => {
  const laneWidth = getLaneWidth(areaWidth, laneCount);
  return laneIndex * laneWidth + (laneWidth - itemWidth) / 2;
};

export const getHitLineY = (
  areaHeight: number,
  bottomOffset: number,
  minY: number
) => {
  return Math.max(minY, areaHeight - bottomOffset);
};
