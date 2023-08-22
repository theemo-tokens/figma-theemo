import Command from './command';
import Emitter from './emitter';

export default class Commander {
  private commands: Map<string, Command> = new Map();
  private emitter;

  constructor(emitter: Emitter) {
    this.emitter = emitter;

    this.listen();
  }

  registerCommand(command: Command) {
    this.commands.set(command.NAME, command);
    command.emitter = this.emitter;
    command.commander = this;
  }

  run(name: string, data?: any) {
    if (this.commands.has(name)) {
      (this.commands.get(name) as Command).execute(data);
    }
  }

  listen() {
    figma.ui.onmessage = msg => {
      if (this.commands.has(msg.command)) {
        (this.commands.get(msg.command) as Command).execute(msg.data);
      }
    };
  }
}