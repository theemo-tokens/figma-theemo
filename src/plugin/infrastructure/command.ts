import Commander from './commander';
import Emitter from './emitter';

export default abstract class Command {
  abstract NAME: string;

  declare commander: Commander;
  declare emitter: Emitter;

  abstract execute(data?: any): void | Promise<void>;

  protected run(name: string) {
    this.commander.run(name);
  }
}
