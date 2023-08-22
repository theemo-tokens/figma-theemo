import { UI_DIMENSIONS } from '../../../config';
import Command from '../../../infrastructure/command';

export default class MinimizeCommand extends Command {
  NAME = 'minimize';

  execute() {
    figma.ui.resize(UI_DIMENSIONS.width, 40);
  }
}