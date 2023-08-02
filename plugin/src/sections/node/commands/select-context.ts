import { Context } from '@theemo-figma/core/node';
import NodeCommand from './command';

export default class SelectContextCommand extends NodeCommand {
  NAME = 'select-context';

  execute(context: Context) {
    this.container.settings.update('context', context);

    this.container.references.eachWithHandler((handler) => {
      handler.applyForContext(context);
    });

    figma.notify(`Context ${context} selected`, {
      timeout: 250
    });

    this.commander.run('read-settings');
  }
}