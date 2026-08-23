export type Todo = {
  id: string;
  name: string;
  order: number;
  memo?: string;
  completed: boolean;
  categoryId: string;
};
