import React, { useState } from "react";
import type { Todo } from "./types";
import dayjs, { Dayjs } from "dayjs";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
};

const CalendarView = (props: Props) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const getDaysInMonth = (date: Dayjs) => {
    const firstDay = date.startOf("month");
    const lastDay = date.endOf("month");
    const daysInMonth = lastDay.date();
    const startDate = firstDay.day(); // 0 = Sunday, 1 = Monday, etc.

    const days: (number | null)[] = Array(startDate).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getTasksForDate = (date: Dayjs) => {
    return props.todos.filter((todo) => {
      if (!todo.deadline) return false;
      return dayjs(todo.deadline).format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
    });
  };

  const hasTaskOnDate = (day: number) => {
    if (!day) return false;
    const date = currentMonth.date(day);
    return getTasksForDate(date).length > 0;
  };

  const days = getDaysInMonth(currentMonth);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Calendar Section - Fixed Height, Scrollable */}
      <div className="shrink-0 overflow-y-auto">
        <div className="pb-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
              className="px-2 py-0.5 rounded-md bg-gray-200 hover:bg-gray-300 font-bold text-sm"
            >
              ◀
            </button>
            <h2 className="text-lg font-bold">
              {currentMonth.format("YYYY年MM月")}
            </h2>
            <button
              onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
              className="px-2 py-0.5 rounded-md bg-gray-200 hover:bg-gray-300 font-bold text-sm"
            >
              ▶
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div key={day} className="text-center font-bold text-xs">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const dateStr = `${weekIndex}-${dayIndex}`;
                const isSelected =
                  selectedDate && day && selectedDate.date() === day;
                const hasTask = day && hasTaskOnDate(day);

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (day) {
                        setSelectedDate(currentMonth.date(day));
                      }
                    }}
                    className={`
                      h-8 flex flex-col items-center justify-center rounded text-xs font-bold
                      ${
                        day
                          ? `cursor-pointer ${
                              isSelected
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`
                          : "bg-white"
                      }
                    `}
                  >
                    {day && (
                      <>
                        <div>{day}</div>
                        {hasTask && (
                          <div className="text-xs flex gap-0.5 mt-0.5">
                            {getTasksForDate(currentMonth.date(day))
                              .slice(0, 2)
                              .map((_, i) => (
                                <div
                                  key={i}
                                  className="w-0.5 h-0.5 rounded-full bg-blue-500"
                                ></div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tasks Section - Scrollable */}
      {selectedDate && (
        <div className="flex-1 overflow-y-auto border-t pt-3 px-2">
          <h3 className="font-bold mb-2 sticky top-0 bg-white">
            {selectedDate.format("YYYY年MM月DD日")} のタスク
          </h3>
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedDateTasks.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  remove={props.remove}
                  updateIsDone={props.updateIsDone}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">この日はタスクがありません。</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
