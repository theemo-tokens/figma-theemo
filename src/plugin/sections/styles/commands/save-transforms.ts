import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@core/styles/commands';
import { readConfig, storeConfig } from '../store';
import { VariableConfig } from '@core/styles';
import { getResolvedValue, isAlias, updateVariable } from '../../../variables';
import { EventName } from '@core/styles/events';

export default class SaveTransformsCommand extends Command {
  NAME = CommandName.SaveTransforms;

  execute(data: Commands[CommandName.SaveTransforms]) {
    const config = readConfig();
    const existing = config.variables.find(
      (varConf) => varConf.variableId === data.variableId && varConf.modeId === data.modeId
    );
    let conf: VariableConfig;

    if (existing) {
      existing.transforms = data.transforms;
      conf = existing;
    } else {
      const referenceAlias = this.findReference(data);

      if (!referenceAlias) {
        return;
      }

      conf = {
        ...data,
        referenceId: referenceAlias.id
      };
      config.variables.push(conf);
      this.unlinkVariable(data);
    }

    storeConfig(config);

    // the pair just saved must land right away, whether or not a paint style
    // happens to be bound to the reference (later origin changes reach it
    // through the StyleUpdated -> updatePaintStyle path)
    updateVariable(conf);

    // update config in UI
    this.emitter.sendEvent(EventName.ConfigArrived, config);
  }

  findReference(data: Commands[CommandName.SaveTransforms]): VariableAlias | undefined {
    const variable = figma.variables.getVariableById(data.variableId);
    const value = variable && variable.valuesByMode[data.modeId];

    // only a real alias can serve as the reference for transforms
    if (value && isAlias(value)) {
      return value;
    }
  }

  unlinkVariable(data: Commands[CommandName.SaveTransforms]) {
    const variable = figma.variables.getVariableById(data.variableId);
    if (!variable) {
      return;
    }

    const value = getResolvedValue(variable, data.modeId);

    // nothing to unlink when the chain dead-ends in a remote/deleted variable
    if (value !== null) {
      variable.setValueForMode(data.modeId, value);
    }
  }
}
