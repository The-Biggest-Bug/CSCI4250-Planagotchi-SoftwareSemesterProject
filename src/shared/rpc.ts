export type RPCSchema<T> = T;

export interface TodoDTO {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type MainViewRPC = {
  bun: RPCSchema<{
    requests: {
      listTodos: {
        params: {};
        response: TodoDTO[];
      };
      addTodo: {
        params: { title: string };
        response: TodoDTO;
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
