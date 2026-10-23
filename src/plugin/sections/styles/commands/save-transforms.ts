import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@core/styles/commands';
import { readConfig, storeConfig } from '../store';
import { VariableConfig } from '@core/styles';
import { getResolvedValue, isAlias, updateVariable } from '../../../variables';
import { EventName } from '@core/styles/events';

export default class SaveTransformsCommand extends Command {
  NAME = CommandName.SaveTransforms;

  async execute(data: Commands[CommandName.SaveTransforms]) {
    const config = await readConfig();
    const existing = config.variables.find(
      (varConf) => varConf.variableId === data.variableId && varConf.modeId === data.modeId
    );
    let conf: VariableConfig;

    if (existing) {
      existing.transforms = data.transforms;
      conf = existing;
    } else {
      const referenceAlias = await this.findReference(data);

      if (!referenceAlias) {
        return;
      }

      conf = {
        ...data,
        referenceId: referenceAlias.id
      };
      config.variables.push(conf);
      await this.unlinkVariable(data);
    }

    await storeConfig(config);

    // the pair just saved must land right away, whether or not a paint style
    // happens to be bound to the reference (later origin changes reach it
    // through the StyleUpdated -> updatePaintStyle path)
    await updateVariable(conf);

    // update config in UI
    this.emitter.sendEvent(EventName.ConfigArrived, config);
  }

  async findReference(
    data: Commands[CommandName.SaveTransforms]
  ): Promise<VariableAlias | undefined> {
    const variable = await figma.variables.getVariableByIdAsync(data.variableId);
    const value = variable && variable.valuesByMode[data.modeId];

    // only a real alias can serve as the reference for transforms
    if (value && isAlias(value)) {
      return value;
    }
  }

  async unlinkVariable(data: Commands[CommandName.SaveTransforms]) {
    const variable = await figma.variables.getVariableByIdAsync(data.variableId);

    if (!variable) {
      return;
    }

    const value = await getResolvedValue(variable, data.modeId);

    // nothing to unlink when the chain dead-ends in a remote/deleted variable
    if (value !== null) {
      variable.setValueForMode(data.modeId, value);
    }
  }
}
