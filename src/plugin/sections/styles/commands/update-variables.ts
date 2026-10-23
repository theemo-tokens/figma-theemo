import Command from '../../../infrastructure/command';
import { CommandName } from '@core/styles/commands';
import { serialize } from '../../../utils';

export default class UpdateVariablesCommand extends Command {
  NAME = CommandName.UpdateVariables;

  async execute() {
    const variables = await figma.variables.getLocalVariablesAsync();
    const vars = Object.fromEntries(
      variables.map((variable) => [variable.id, serialize(variable)])
    );
    figma.root.setPluginData('variables', JSON.stringify(vars));

    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const storedCollections = Object.fromEntries(
      collections.map((col) => [col.id, serialize(col)])
    );
    figma.root.setPluginData('variableCollections', JSON.stringify(storedCollections));
  }
}
