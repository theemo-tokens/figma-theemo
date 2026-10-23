import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@core/styles/commands';
import { readConfig, storeConfig } from '../store';
import { VariableConfig } from '@core/styles';

export default class DeleteTransformsCommand extends Command {
  NAME = CommandName.DeleteTransforms;

  async execute(data: Commands[CommandName.DeleteTransforms]) {
    const config = await readConfig();
    const existing = config.variables.find(
      (varConf) => varConf.variableId === data.variableId && varConf.modeId === data.modeId
    );

    if (existing) {
      config.variables.splice(config.variables.indexOf(existing), 1);

      await storeConfig(config);

      await this.linkVariable(existing);
    }
  }

  async linkVariable(data: VariableConfig) {
    const variable = await figma.variables.getVariableByIdAsync(data.variableId);
    const reference = await figma.variables.getVariableByIdAsync(data.referenceId);

    if (variable && reference) {
      const alias = figma.variables.createVariableAlias(reference);
      variable.setValueForMode(data.modeId, alias);
    }
  }
}
