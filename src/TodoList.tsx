import React, { useState } from "react";
import type { Todo } from "./types";
import TodoItem from "./TodoItem";
import CalendarView from "./CalendarView";

type Props = {
    todos: Todo[];
    updateIsDone: (id: string, value: boolean) => void;
    remove: (id: string) => void;
    setTodos: (todos: Todo[]) => void;
};

type SortType = "deadline" | "priority";
type ViewMode = "list" | "calendar";

const TodoList = (props: Props) => {
    const [sortType, setSortType] = useState<SortType>("deadline");
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    const sortTodos = (todos: Todo[], sort: SortType): Todo[] => {
        const sorted = [...todos];
        
        if (sort === "deadline") {
            return sorted.sort((a, b) => {
                // 期限がない場合は最後に
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                
                const deadlineCompare = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                if (deadlineCompare !== 0) return deadlineCompare;
                
                // 期限が同じ場合は優先度で比較（小さい方が上）
                return a.priority - b.priority;
            });
        } else {
            // 優先度順（小さい方が上）
            return sorted.sort((a, b) => {
                const priorityCompare = a.priority - b.priority;
                if (priorityCompare !== 0) return priorityCompare;
                
                // 優先度が同じ場合は期限で比較
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            });
        }
    };

    const removeCompletedTodos = () => {
        // 親コンポーネントの setTodos を使って未完了タスクだけを一度に設定する
        const incompleteTodos = props.todos.filter((todo) => !todo.isDone);
        props.setTodos(incompleteTodos);
    };

    const sortedTodos = sortTodos(props.todos, sortType);
    const todos = sortedTodos;

    if (todos.length === 0) {
        return (
            <div className="text-red-500">
                現在、登録されているタスクはありません。
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Sort and Delete Buttons */}
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => setSortType("deadline")}
                    className={`px-3 py-1 rounded-md font-bold text-sm ${
                        sortType === "deadline"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    期限が近い順
                </button>
                <button
                    onClick={() => setSortType("priority")}
                    className={`px-3 py-1 rounded-md font-bold text-sm ${
                        sortType === "priority"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    優先度順
                </button>
                <button
                    onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
                    className={`px-3 py-1 rounded-md font-bold text-sm ${
                        viewMode === "calendar"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    {viewMode === "list" ? "カレンダー" : "リスト"}
                </button>
                <button
                    onClick={removeCompletedTodos}
                    className="ml-auto px-3 py-1 rounded-md bg-orange-500 text-white font-bold text-sm hover:bg-orange-600"
                >
                    完了したタスクを削除
                </button>
            </div>

            {/* Content Area */}
            {viewMode === "list" ? (
                /* Todo Items - Scrollable */
                <div className="flex-1 overflow-y-auto space-y-2 mt-3">
                    {todos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            remove={props.remove}
                            updateIsDone={props.updateIsDone}
                        />
                    ))}
                </div>
            ) : (
                /* Calendar View */
                <div className="flex-1 overflow-y-auto mt-3 px-2">
                    <CalendarView
                        todos={props.todos}
                        updateIsDone={props.updateIsDone}
                        remove={props.remove}
                    />
                </div>
            )}
        </div>
    );
};

export default TodoList;