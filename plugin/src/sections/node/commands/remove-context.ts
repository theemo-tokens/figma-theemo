import { Context } from '@theemo-figma/core/node';
import NodeCommand from './command';

export default class RemoveContextCommand extends NodeCommand {
  NAME = 'remove-context';

  execute(ctx: Context) {
    const settings = this.container.settings;
    const contexts = new Set(settings.get('contexts'));
    contexts.delete(ctx);
    settings.update('contexts', Array.from(contexts.values()));
    this.run('read-settings');
  }
}