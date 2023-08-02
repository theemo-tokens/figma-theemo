import NodeCommand from './command';

export default class UpdateStylesCommand extends NodeCommand {
  NAME = 'update-styles';

  execute() {
    this.container.references.eachWithHandler((handler) => {
      handler.updateStyles();
    });
  }
}
