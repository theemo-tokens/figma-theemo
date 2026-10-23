import Commander from './commander';
import Emitter from './emitter';

export interface Infrastructure {
  commander: Commander;
  emitter: Emitter;
}
