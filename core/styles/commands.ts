import { Transforms } from '../transforms';

export enum CommandName {
  SaveTransforms = 'styles.save-transforms',
  DeleteTransforms = 'styles.delete-transforms',
  ReadConfig = 'styles.read-config',
  LinkReference = 'styles.link-reference',
  UnlinkReference = 'styles.unlink-reference'
}

export interface Commands {
  [CommandName.SaveTransforms]: {
    variableId: string;
    modeId: string;
    transforms: Transforms;
  };
  [CommandName.DeleteTransforms]: {
    variableId: string;
    modeId: string;
  };
  [CommandName.ReadConfig]: undefined;
  [CommandName.LinkReference]: {
    styleId: string;
    referenceId: string;
  };
  [CommandName.UnlinkReference]: {
    styleId: string;
  }
}