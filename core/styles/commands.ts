import { Transforms } from '../transforms';
import { VariableConfig } from './index';

export enum CommandName {
  SaveTransforms = 'styles.save-transforms',
  DeleteTransforms = 'styles.delete-transforms',
  ReadConfig = 'styles.read-config',
  LinkReference = 'styles.link-reference',
  UnlinkReference = 'styles.unlink-reference',
  UpdateVariables = 'styles.update-variables',
}

export interface Commands {
  [CommandName.SaveTransforms]: Pick<VariableConfig, 'variableId' | 'modeId' | 'transforms'>;
  [CommandName.DeleteTransforms]: Pick<VariableConfig, 'variableId' | 'modeId'>;
  [CommandName.ReadConfig]: undefined;
  [CommandName.LinkReference]: {
    styleId: string;
    referenceId: string;
  };
  [CommandName.UnlinkReference]: {
    styleId: string;
  };
  [CommandName.UpdateVariables]: undefined;
}