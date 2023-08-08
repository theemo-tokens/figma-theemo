import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@theemo-figma/core/styles/commands';
import { readConfig, storeConfig } from '../store';

export default class DeleteTransformsCommand extends Command {
  NAME = CommandName.DeleteTransforms;

  execute(data: Commands[CommandName.DeleteTransforms]) {
    const config = readConfig();
    const existing = config.variables.find(varConf => varConf.variableId === data.variableId && varConf.modeId === data.modeId);

    if (existing) {
      config.variables.splice(config.variables.indexOf(existing), 1);

      storeConfig(config);
    }
  }
}