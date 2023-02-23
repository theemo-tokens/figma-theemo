export function findThemeStyle() {
  const grids = figma.getLocalGridStyles();
  return grids.find(grid => grid.name === 'theemo/features');
}