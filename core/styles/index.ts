import { Transforms } from '../transforms';

export interface StyleDescriptor {
  id: string;
  name: string;
  style: PaintStyle | EffectStyle | TextStyle;
  reference?: string;
  transforms?: Transforms;
}

export interface StyleConfig {
  styleId: string;
  /** Id of the referenced style */
  referenceId: string;
}

export interface VariableConfig {
  variableId: string;
  modeId: string;
  /** Id of the referenced variable */
  referenceId: string;
  transforms: Transforms;
}

export interface Config {
  styles: StyleConfig[];
  variables: VariableConfig[];
}