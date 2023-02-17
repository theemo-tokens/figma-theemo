import { canHandleNode } from './nodes/utils';
import { RefNode } from './nodes/types';
import Container from './container/index';
import TokenObserver from './token-observer';

figma.showUI(__html__, {
  width: 380,
  height: 350,
  themeColors: true
});


const container = new Container();
const commander = container.commander;
const emitter = container.emitter;

commander.run('migrate');
commander.run('read-settings');

// observe styles and tokens
new TokenObserver(container);

// handle selection
handleSelection(figma.currentPage.selection);
figma.on('selectionchange', () => {
  if (!handleSelection(figma.currentPage.selection)) {
    emitter.sendEvent('selection-changed', null);
  }
});

function handleSelection(selection: readonly SceneNode[]) {
  if (selection.length > 0 && canHandleNode(selection[0])) {
    const manager = container.registry.get(selection[0] as RefNode);
    emitter.sendEvent('selection-changed', manager.data);
    return true;
  } else {
    return false;
  }
}
