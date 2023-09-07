import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@theemo-figma/core/styles/commands';
import { readConfig, storeConfig } from '../store';
import { VariableConfig } from '@theemo-figma/core/styles';
import { findVariableFromAlias, getResolvedValue } from '../../../variables';
import { findVariableAlias, hasBoundVariable } from '../../../styles';
import { updatePaintStyle } from '../referencer';
import { EventName } from '@theemo-figma/core/styles/events';

export default class SaveTransformsCommand extends Command {
  NAME = CommandName.SaveTransforms;

  execute(data: Commands[CommandName.SaveTransforms]) {
    const config = readConfig();
    const existing = config.variables.find(varConf => varConf.variableId === data.variableId && varConf.modeId === data.modeId);
    const referenceAlias = this.findReference(data);

    if (existing) {
      existing.transforms = data.transforms;
    } else {
      const conf: VariableConfig = {
        ...data,
        referenceId: referenceAlias.id
      };
      config.variables.push(conf);
      this.unlinkVariable(data);
    }

    storeConfig(config);

    // attempt an update
    const reference = figma.variables.getVariableById(referenceAlias.id);

    if (reference) {
      const consumingStyles = figma.getLocalPaintStyles().filter(style => {
        if (hasBoundVariable(style)) {
          const alias = findVariableAlias(style);
          const variable = alias && findVariableFromAlias(alias);

          return variable && variable.id === reference.id;
        }
        return false;
      });

      for (const styleToUpdate of consumingStyles) {
        updatePaintStyle({ style: styleToUpdate, id: styleToUpdate.id, name: styleToUpdate.name });
      }
    }

    // update config in UI
    this.emitter.sendEvent(EventName.ConfigArrived, config);
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