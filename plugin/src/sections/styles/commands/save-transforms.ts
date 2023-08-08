import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@theemo-figma/core/styles/commands';
import { readConfig, storeConfig } from '../store';

export default class SaveTransformsCommand extends Command {
  NAME = CommandName.SaveTransforms;

  execute(data: Commands[CommandName.SaveTransforms]) {
    const config = readConfig();
    const existing = config.variables.find(varConf => varConf.variableId === data.variableId && varConf.modeId === data.modeId);

    if (existing) {
      existing.transforms = data.transforms;
    } else {
      config.variables.push(data);
    }

    storeConfig(config);
  }
}