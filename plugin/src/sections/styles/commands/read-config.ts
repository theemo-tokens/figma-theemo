import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@theemo-figma/core/styles/commands';
import { readConfig } from '../store';
import { EventName } from '@theemo-figma/core/styles/events';

export default class ReadConfigCommand extends Command {
  NAME = CommandName.ReadConfig;

  execute(data: Commands[CommandName.ReadConfig]) {
    const config = readConfig();
    
    this.emitter.sendEvent(EventName.ConfigArrived, config);
  }
}