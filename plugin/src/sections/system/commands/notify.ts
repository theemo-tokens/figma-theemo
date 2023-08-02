import Command from '../../../infrastructure/command';

export default class NotifyCommand extends Command {
  NAME = 'notify';

  execute(message: string) {
    figma.notify(message);
  }
}