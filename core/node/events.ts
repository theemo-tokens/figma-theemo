interface Reference {
  from: string;
  to: string;
  transforms: {};
}

export interface CollectedReferencesNode {
  node: {
    id: string;
  },
  fill?: Reference;
  stroke?: Reference;
  effect?: Reference;
  text?: Reference;
}

export interface CollectedReferencesPayload {
  document: {
    id: string;
    name: string;
  },
  nodes: CollectedReferencesNode[]
}

export interface StatsPayload {
  total: number;
  text: number;
  fill: number;
  stroke: number;
  effect: number;
  contexts: number;
}

export enum StyleTypes {
  Fill = 'fill',
  Stroke = 'stroke',
  Effect = 'effect',
  Text = 'text'
}

export interface NodesWithStyles {
  id: string;
  name: string;
  styles: StyleTypes[]
}

export type NodesPayload = NodesWithStyles[];