import { canHandleNode } from './utils';
import { RefNode } from './types';
import Container from './container';
import Emitter from '../../infrastructure/emitter';

export function handleSelection(selection: readonly SceneNode[], container: Container, emitter: Emitter) {
  if (selection.length > 0 && canHandleNode(selection[0])) {
    const manager = container.registry.get(selection[0] as RefNode);
    emitter.sendEvent('selection-changed', manager.data);
    return true;
  } else {
    return false;
  }
}