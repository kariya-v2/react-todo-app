import { useState, useEffect } from "react";
import type { Todo } from "./types";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";

const App = () => {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoNameError, setNewTodoNameError] = useState("");

  const [initialized, setInitialized] = useState(false);
  const localStorageKey = "TodoApp";

  // マウント時に localStorage から復元する
  useEffect(() => {
    try {
      const todoJsonStr = localStorage.getItem(localStorageKey);
      if (todoJsonStr) {
        const raw = JSON.parse(todoJsonStr) as unknown;
        if (Array.isArray(raw)) {
          const converted = raw.map((item) => {
            const t = item as Partial<Todo> & { deadline?: string | null };
            return {
              ...(t as Todo),
              deadline: t.deadline ? new Date(t.deadline) : null,
            } as Todo;
          });
          setTodos(converted);
        }
      }
    } catch (e) {
      // 破損したデータがあれば無視して初期化されたままにする
      console.warn("TodoApp: failed to parse localStorage data", e);
    } finally {
      setInitialized(true);
    }
  }, []);

  // todos の変更を localStorage に保存する（初期復元が終わってから）
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
    } catch (e) {
      console.warn("TodoApp: failed to save todos to localStorage", e);
    }
  }, [todos, initialized]);

  const uncompletedCount = todos.filter((todo: Todo) => !todo.isDone).length;

  // Validation
  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "2文字以上、32文字以内で入力してください";
    }
    return "";
  };

  // Event Handlers
  const updateNewTodoName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoNameError(isValidTodoName(e.target.value));
    setNewTodoName(e.target.value);
  };

  // radio からボタン方式に変更したため既存のハンドラは使わないが
  // 将来の保守用に残す場合はプレフィックス _ を付ける
  const _updateNewTodoPriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const isNewDeadlinePast =
    newTodoDeadline !== null && dayjs(newTodoDeadline).isBefore(dayjs());

  const updateIsDone = (id: string, value: boolean) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, isDone: value } : todo
    );
    setTodos(updatedTodos);
  };

  const remove = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const addNewTodo = () => {
    const err = isValidTodoName(newTodoName);
    if (err !== "") {
      setNewTodoNameError(err);
      return;
    }

    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName,
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };

    setTodos([...todos, newTodo]);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
  };

  return (
    <div className="mx-4 mt-10 max-w-6xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">TodoApp</h1>

      <div className="mb-4">
        <WelcomeMessage
          name="高専の宝"
          uncompletedCount={uncompletedCount}
        />
      </div>

      <div className="flex gap-6">
        {/* Left: New Todo Form */}
        <div className="w-full md:w-96">
          <div className="space-y-2 rounded-md border p-3">
            <h2 className="text-lg font-bold">新しいタスクの追加</h2>

            {/* Task Name Input */}
            <div>
              <div className="flex items-center space-x-2">
                <label className="font-bold" htmlFor="newTodoName">
                  名前
                </label>
                <input
                  id="newTodoName"
                  type="text"
                  value={newTodoName}
                  onChange={updateNewTodoName}
                  className={twMerge(
                    "grow rounded-md border p-2",
                    newTodoNameError && "border-red-500 outline-red-500"
                  )}
                  placeholder="2文字以上、32文字以内で入力してください"
                />
              </div>
              {newTodoNameError && (
                <div className="ml-10 flex items-center space-x-1 text-sm font-bold text-red-500">
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mr-0.5"
                  />
                  <div>{newTodoNameError}</div>
                </div>
              )}
            </div>

            {/* Priority Selection */}
            <div className="flex gap-5 items-center">
              <div className="font-bold">優先度</div>
              {[1, 2, 3].map((value) => {
                const label = value === 1 ? "高" : value === 2 ? "中" : "低";
                const cls =
                  value === 1
                    ? "bg-red-100 text-red-700"
                    : value === 2
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700";
                const active = newTodoPriority === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNewTodoPriority(value)}
                    className={`${cls} ${
                      active ? "ring-2 ring-offset-1 ring-indigo-300" : ""
                    } rounded-full px-3 py-0.5 font-bold text-sm`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Deadline Input */}
            <div className="flex items-center gap-x-2">
              <label htmlFor="deadline" className="font-bold">
                期限
              </label>
              <input
                type="datetime-local"
                id="deadline"
                value={
                  newTodoDeadline
                    ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss")
                    : ""
                }
                onChange={updateDeadline}
                className={twMerge(
                  "rounded-md px-2 py-0.5",
                  isNewDeadlinePast ? "border border-red-500 bg-red-50" : "border border-gray-400"
                )}
              />
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={addNewTodo}
              className={twMerge(
                "rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600",
                newTodoNameError && "cursor-not-allowed opacity-50"
              )}
            >
              追加
            </button>
          </div>
        </div>

        {/* Right: Todo List */}
        <div className="flex-1">
          <TodoList todos={todos} updateIsDone={updateIsDone} remove={remove} setTodos={setTodos} />
        </div>
      </div>
    </div>
  );
};

export default App;