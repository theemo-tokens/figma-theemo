import { COLLECTION, StyleTypes } from './types';
import { Context } from '@theemo-figma/core/node';

export default interface StyleAdapter {
  type: StyleTypes;
  collection: COLLECTION;

  local?: BaseStyle;
  from?: BaseStyle;
  to?: BaseStyle;

  /**
   * If the style is contextual, this is the reference to the context free
   * style
   */
  context?: BaseStyle;

  read(): void;
  load(): void;
  save(): void;
  delete(): void;
  compile();

  getPool(): BaseStyle[];

  // checks
  needsUnlink(): boolean;
  hasReference(): boolean;
  isContextual(context: string): boolean;

  // UI commands
  linkOrigin(name: string): void;
  migrateOrigin(target: string): void;
  unlinkOrigin(): void;
  createReference(fromId: string, name: string): void;
  unlinkReference(): void;
  saveTransforms(transforms: object): void;

  // commands
  updateStyle(): void;
  // createContextFree();
  // createContextFreeInActiveContext();

  applyForContext(context: Context): void;
}