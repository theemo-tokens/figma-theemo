import Command from '../../../infrastructure/command';
import Container from '../container';

export default abstract class NodeCommand extends Command {
  protected container: Container;

  constructor(container: Container) {
    super();
    this.container = container;
  }
}