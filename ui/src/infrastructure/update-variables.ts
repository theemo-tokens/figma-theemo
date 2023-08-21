import { CommandName } from '@theemo-figma/core/styles/commands';
import { messenger } from '../infrastructure';

let interval = 30 * 60; // 30 seconds

window.setInterval(() => {
  messenger.send(CommandName.UpdateVariables);
}, interval);