import { handleSelection } from '../selection';
import NodeCommand from './command';

export default class ReadSelectionCommand extends NodeCommand {
  NAME = 'read-selection';

  execute() {
    handleSelection(figma.currentPage.selection, this.container, this.emitter);
  }
}
