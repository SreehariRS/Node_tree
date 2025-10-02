export interface Node {
  _id: string;
  name: string;
  parent?: string | null;
  children?: Node[];
}