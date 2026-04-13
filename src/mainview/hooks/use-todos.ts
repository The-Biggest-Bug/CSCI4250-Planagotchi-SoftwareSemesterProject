import { useCallback, useEffect, useState } from "react";
import type { PetDTO, TodoDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";

interface UseTodosOptions {
  onPetStateChange?: (pet: PetDTO) => void;
}

export default function useTodos(options: UseTodosOptions = {}) {
  const { onPetStateChange } = options;
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTodos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await electroview.rpc!.request.listTodos({});
      setTodos(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTodos();
  }, [refreshTodos]);

  const addTodo = useCallback((todo: TodoDTO) => {
    setTodos((prev) => [todo, ...prev]);
  }, []);

  const updateTodo = useCallback((updated: TodoDTO) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === updated.id ? updated : todo)),
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const removeTodo = useCallback(async (id: number) => {
    const result = await electroview.rpc!.request.deleteTodo({ id });
    if (result.success) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
    return result.success;
  }, []);

  const toggleTodo = useCallback(async (id: number) => {
    const updated = await electroview.rpc!.request.toggleTodo({ id });
    if (updated) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updated.todo.id ? updated.todo : todo)),
      );
      onPetStateChange?.(updated.pet);
    }
    return updated?.todo ?? null;
  }, [onPetStateChange]);

  return {
    todos,
    loading,
    refreshTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    removeTodo,
    toggleTodo,
  };
}
