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