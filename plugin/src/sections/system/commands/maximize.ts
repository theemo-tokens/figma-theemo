import { UI_DIMENSIONS } from '../../../config';
import Command from '../../../infrastructure/command';

export default class MaximizeCommand extends Command {
  NAME = 'maximize';

  execute() {
    figma.ui.resize(UI_DIMENSIONS.width, UI_DIMENSIONS.height);
  }
}