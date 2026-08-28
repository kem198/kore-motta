export type ListItem = {
  text: string;
  children?: string[];
};

export type ListItemWithTitle = {
  title: string;
  items: ListItem[];
};
