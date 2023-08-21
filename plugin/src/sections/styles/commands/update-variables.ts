import Command from '../../../infrastructure/command';
import { CommandName } from '@theemo-figma/core/styles/commands';
import { serialize } from '../../../utils';

export default class UpdateVariablesCommand extends Command {
  NAME = CommandName.UpdateVariables;

  execute() {
    const vars = Object.fromEntries(figma.variables.getLocalVariables().map(variable => [variable.id, serialize(variable)]));
    figma.root.setPluginData('variables', JSON.stringify(vars));

    const collections = Object.fromEntries(figma.variables.getLocalVariableCollections().map(col => [col.id, serialize(col)]));
    figma.root.setPluginData('variableCollections', JSON.stringify(collections));
  }
}