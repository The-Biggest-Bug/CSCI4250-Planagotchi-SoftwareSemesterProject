export type RPCSchema<T> = T;

export interface TodoDTO {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  dueAt: string | null;
}

export type MainViewRPC = {
  bun: RPCSchema<{
    requests: {
      listTodos: {
        params: {};
        response: TodoDTO[];
      };
      addTodo: {
        params: { title: string; description?: string; dueAt?: string };
        response: TodoDTO;
      };
      updateTodo: {
        params: { id: number; title?: string; description?: string | null; dueAt?: string | null };
        response: TodoDTO | null;
      };
      toggleTodo: {
        params: { id: number };
        response: TodoDTO | null;
      };
      deleteTodo: {
        params: { id: number };
        response: { success: boolean };
      };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};
