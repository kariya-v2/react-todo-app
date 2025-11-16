import React from "react";
import type { Todo } from "./types";
import dayjs from "dayjs";

type Props = {
    todo: Todo;
    updateIsDone: (id: string, value: boolean) => void;
    remove: (id: string) => void;
};

const TodoItem = (props: Props) => {
    const todo = props.todo;
    const isOverdue = !!(
        todo.deadline && !todo.isDone && dayjs(todo.deadline).isBefore(dayjs())
    );

    // 優先度ラベルとクラス
    const priorityLabel = todo.priority === 1 ? "高" : todo.priority === 2 ? "中" : "低";
    const priorityClass =
        todo.priority === 1
            ? "bg-red-100 text-red-700"
            : todo.priority === 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700";

    return (
        <div
            className={`flex items-center justify-between rounded-md p-3 ${
                isOverdue ? "border border-red-400 bg-red-50" : "border"
            }`}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={todo.isDone}
                        onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
                        className="mr-2 cursor-pointer"
                    />
                    <span className={todo.isDone ? "line-through text-gray-500" : ""}>
                        {todo.name}
                    </span>
                </div>
                <div className="ml-6 flex gap-4 items-center text-sm">
                    {todo.deadline && (
                        <div className={isOverdue ? "text-red-600" : "text-gray-600"}>
                            期限: {dayjs(todo.deadline).format("YYYY年MM月DD日 HH:mm")}
                        </div>
                    )}
                    <div>
                        優先度:
                        <span
                            className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-sm font-bold ${priorityClass}`}
                        >
                            {priorityLabel}
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <button
                    onClick={() => props.remove(todo.id)}
                    className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-red-600"
                >
                    削除
                </button>
            </div>
        </div>
    );
};

export default TodoItem;