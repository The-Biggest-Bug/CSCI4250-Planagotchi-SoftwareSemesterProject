export type RPCSchema<T> = T;
export type PetMoodDTO = "idle" | "sad" | "angry";

export interface TodoDTO {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  dueAt: string | null;
  recurrenceType: "daily" | "weekly" | "monthly" | null;
  recurrenceInterval: number | null;
}

export type AppBackgroundKind = "preset" | "custom";

export interface AppBackgroundDTO {
  kind: AppBackgroundKind;
  value: string;
}

export interface AppSettingsDTO {
  eggColor: string;
  eggBackground: string;
  petBackground: AppBackgroundDTO;
  hardMode: boolean;
}

export interface PetDTO {
  kind: "dino" | "hamster";
  health: number;
  maxHealth: number;
  xp: number;
  evolutionLevel: number;
  evolutionImageIndex: number;
  xpIntoCurrentEvolution: number;
  xpForNextEvolution: number;
  mood: PetMoodDTO;
  productivityScore: number;
  streakDays: number;
}

export type MainViewRPC = {
  bun: RPCSchema<{
    requests: {
      listTodos: {
        params: {};
        response: TodoDTO[];
      };
      addTodo: {
        params: {
          title: string;
          description?: string;
          dueAt?: string;
          recurrenceType?: "daily" | "weekly" | "monthly" | null;
          recurrenceInterval?: number | null;                       
        };
        response: TodoDTO;
      };
      updateTodo: {
        params: {
          id: number;
          title?: string;
          description?: string | null;
          dueAt?: string | null;
          recurrenceType?: "daily" | "weekly" | "monthly" | null;
          recurrenceInterval?: number | null;     
        };
        response: TodoDTO | null;
      };
      toggleTodo: {
        params: { id: number };
        response: { todo: TodoDTO; pet: PetDTO } | null;
      };
      deleteTodo: {
        params: { id: number };
        response: { success: boolean };
      };
      getPetState: {
        params: {};
        response: PetDTO;
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
      setPetBackground: {
        params: AppBackgroundDTO;
        response: AppBackgroundDTO;
      };
      setHardMode: {
        params: { enabled: boolean };
        response: { enabled: boolean };
      };
      closeApp: {
        params: {};
        response: { success: boolean };
      };
      resetAllData: {
        params: {};
        response: {
          success: boolean;
          appSettings: AppSettingsDTO;
          pet: PetDTO;
        };
      };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};
