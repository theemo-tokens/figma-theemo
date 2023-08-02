import { Transforms } from '../transforms';

export interface StyleDescriptor {
  id: string;
  name: string;
  style: PaintStyle | EffectStyle | TextStyle;
  reference?: string;
  transforms?: Transforms;
}