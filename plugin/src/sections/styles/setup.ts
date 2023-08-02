import { Infrastructure } from '../../infrastructure';
import { StylesObserver } from './styles';

export function setupStyles(infrastructure: Infrastructure) {
  new StylesObserver(infrastructure.emitter);
}
