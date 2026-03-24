import * as React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay, isAfter } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "./Button";

export interface CalendarProps {
  selectedDays?: Date[];
  onDayClick?: (day: Date) => void;
  className?: string;
}

export function Calendar({ selectedDays = [], onDayClick, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className={cn("p-4 bg-white rounded-xl border border-slate-200", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const isSelected = selectedDays.some((d) => isSameDay(d, day));
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              onClick={() => onDayClick?.(day)}
              disabled={!isAfter(startOfDay(day), startOfDay(new Date())) && !isToday}
              className={cn(
                "h-10 w-full rounded-md flex items-center justify-center text-sm transition-colors relative",
                !isCurrentMonth && "text-slate-300",
                isToday && "border border-orange-500 text-orange-600 font-bold",
                isSelected && "bg-orange-600 text-white hover:bg-orange-700",
                !isSelected && isCurrentMonth && "hover:bg-slate-100",
                !isAfter(startOfDay(day), startOfDay(new Date())) && !isToday && "opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {format(day, "d")}
              {!isAfter(startOfDay(day), startOfDay(new Date())) && !isToday && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-[1px] bg-slate-400 rotate-45 opacity-50" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
