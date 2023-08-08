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
  transforms: Transforms;
}

export interface Config {
  styles: StyleConfig[];
  variables: VariableConfig[];
}