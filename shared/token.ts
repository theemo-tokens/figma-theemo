import { BaseToken } from '@theemo/core';

export interface Token extends BaseToken {
  id: string;
  style?: PaintStyle | EffectStyle | TextStyle | GridStyle;
}