export type Todo = {
  id: string;
  name: string;
  memo?: string;
  completed: boolean;
  categoryId: string;
  position: number;
};
