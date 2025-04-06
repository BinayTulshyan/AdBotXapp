import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "lucide-react";
import { DateRange as ReactDayPickerDateRange } from "react-day-picker";
import { DateRange } from "@/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  onSelect,
  className,
}: DatePickerWithRangeProps) {
  const [dateState, setDateState] = React.useState<DateRange | undefined>(
    date || {
      from: new Date(),
      to: addDays(new Date(), 30),
    }
  );

  React.useEffect(() => {
    if (date) {
      setDateState(date);
    }
  }, [date]);

  const handleSelect = (selectedDate: ReactDayPickerDateRange | undefined) => {
    if (selectedDate) {
      const newDate: DateRange = {
        from: selectedDate.from || new Date(),
        to: selectedDate.to,
      };
      setDateState(newDate);
      if (onSelect) {
        onSelect(newDate);
      }
    } else {
      setDateState(undefined);
      if (onSelect) {
        onSelect(undefined);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateState && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateState?.from ? (
              dateState.to ? (
                <>
                  {format(dateState.from, "LLL dd, y")} -{" "}
                  {format(dateState.to, "LLL dd, y")}
                </>
              ) : (
                format(dateState.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateState?.from}
            selected={dateState}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
