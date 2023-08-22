import { Context } from '@theemo-figma/core/node';
import NodeCommand from './command';

export default class AddContextCommand extends NodeCommand {
  NAME = 'add-context';

  execute(ctx: Context) {
    const contexts = new Set(this.container.settings.get('contexts'));
    contexts.add(ctx);
    this.container.settings.update('contexts', Array.from(contexts.values()));
    this.run('read-settings');
  }
}