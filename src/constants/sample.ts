import { MESSAGES } from "@/constants/messages";
import { Todo } from "@/types/todo";

export const sampleTodos: Todo[] = [
  {
    id: "sample-wallet",
    name: MESSAGES.sample.item1,
    order: 0,
  },
  {
    id: "sample-key",
    name: MESSAGES.sample.item2,
    order: 1,
    memo: MESSAGES.sample.item2Memo,
  },
];
