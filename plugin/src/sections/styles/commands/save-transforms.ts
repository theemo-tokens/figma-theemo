import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@theemo-figma/core/styles/commands';
import { readConfig, storeConfig } from '../store';
import { VariableConfig } from '@theemo-figma/core/styles';
import { getResolvedValue } from '../../../variables';

export default class SaveTransformsCommand extends Command {
  NAME = CommandName.SaveTransforms;

  execute(data: Commands[CommandName.SaveTransforms]) {
    const config = readConfig();
    const existing = config.variables.find(varConf => varConf.variableId === data.variableId && varConf.modeId === data.modeId);

    if (existing) {
      existing.transforms = data.transforms;
    } else {
      const reference = this.findReference(data);
      const conf: VariableConfig = {
        ...data,
        referenceId: reference.id
      };
      config.variables.push(conf);
      this.unlinkVariable(data);
    }

    storeConfig(config);
  }

  findReference(data: Commands[CommandName.SaveTransforms]): VariableAlias {
    const variable = figma.variables.getVariableById(data.variableId) as Variable;
    return variable.valuesByMode[data.modeId] as VariableAlias;
  }

  unlinkVariable(data: Commands[CommandName.SaveTransforms]) {
    const variable = figma.variables.getVariableById(data.variableId) as Variable;
    const value = getResolvedValue(variable, data.modeId);
    variable.setValueForMode(data.modeId, value);

  }
}