// import Emitter from '../container/emitter';
// import Container from '../container/index';
// import Commander from '../container/commander';

import Commander from './commander';
import Emitter from './emitter';

export default abstract class Command {
  abstract NAME: string;

  declare commander: Commander;
  declare emitter: Emitter;

  abstract execute(data?: any): void;

  protected nodeExists(id: string) {
    return !!figma.getNodeById(id);
  }

  protected run(name: string) {
    this.commander.run(name);
  }
}