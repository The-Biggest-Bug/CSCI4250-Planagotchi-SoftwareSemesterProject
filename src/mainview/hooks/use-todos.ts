import { useCallback, useEffect, useState } from "react";
import type { TodoDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";

export default function useTodos() {
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

  const toggleTodo = useCallback(async (id: number) => {
    const updated = await electroview.rpc!.request.toggleTodo({ id });
    if (updated) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updated.id ? updated : todo)),
      );
    }
    return updated;
  }, []);

  return {
    todos,
    loading,
    refreshTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
}
