import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@core/styles/commands';
import { readConfig } from '../store';
import { EventName } from '@core/styles/events';

export default class ReadConfigCommand extends Command {
  NAME = CommandName.ReadConfig;

  async execute(_data: Commands[CommandName.ReadConfig]) {
    const config = await readConfig();

    this.emitter.sendEvent(EventName.ConfigArrived, config);
  }
}
