export type RPCSchema<T> = T;

export interface TodoDTO {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  dueAt: string | null;
}

export type AppBackgroundKind = "preset" | "custom";

export interface AppBackgroundDTO {
  kind: AppBackgroundKind;
  value: string;
}

export interface AppSettingsDTO {
  eggColor: string;
  eggBackground: string;
  dinoBackground: AppBackgroundDTO;
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
        params: {
          id: number;
          title?: string;
          description?: string | null;
          dueAt?: string | null;
        };
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
      getAppSettings: {
        params: {};
        response: AppSettingsDTO;
      };
      setEggColor: {
        params: { color: string };
        response: { color: string };
      };
      setEggBackground: {
        params: { value: string };
        response: { value: string };
      };
      setDinoBackground: {
        params: AppBackgroundDTO;
        response: AppBackgroundDTO;
      };
      closeApp: {
        params: {};
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
