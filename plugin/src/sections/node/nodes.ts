export function findPageForNode(node: SceneNode): PageNode | undefined {
  for (const page of figma.root.children) {
    const finds = page.findAll((scene) => scene === node);

    if (finds.length === 1 && finds[0] === node) {
      return page;
    }
  }
}