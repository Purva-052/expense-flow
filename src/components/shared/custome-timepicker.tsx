/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface TimePickerProps {
  value: any;
  onChange: (val: string) => void;
  placeholder?: string;
  minTime?: string;
  className?: string;
}

const TimePicker = ({
  value,
  onChange,
  placeholder,
  minTime,
  className,
}: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Extract min-time in 24-hour format
  const minHour = minTime ? Number(minTime.split(":")[0]) : null;
  const minMinute = minTime ? Number(minTime.split(":")[1]) : null;

  // Convert 24-hour to 12-hour format
  const convertTo12Hour = (hour24: number) => {
    if (hour24 === 0) return { hour: 12, period: "AM" };
    if (hour24 < 12) return { hour: hour24, period: "AM" };
    if (hour24 === 12) return { hour: 12, period: "PM" };
    return { hour: hour24 - 12, period: "PM" };
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour12: number, period: string) => {
    if (period === "AM") {
      return hour12 === 12 ? 0 : hour12;
    } else {
      return hour12 === 12 ? 12 : hour12 + 12;
    }
  };

  // Format time for display (12-hour format)
  const formatDisplayTime = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    const { hour, period } = convertTo12Hour(Number(h));
    return `${String(hour).padStart(2, "0")}:${m} ${period}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const minutes = Array.from({ length: 60 }, (_, i) => {
    const currentHour24 = convertTo24Hour(Number(selectedHour), selectedPeriod);
    // If selecting SAME hour as min hour → block old minutes
    if (
      minHour !== null &&
      currentHour24 === minHour &&
      i < minMinute!
    ) {
      return null;
    }
    return String(i).padStart(2, "0");
  }).filter(Boolean) as string[];

  const periods = ["AM", "PM"];

  // -------- FIX 1: Auto-adjust invalid value passed from outside -------
  useEffect(() => {
    if (value && minTime) {
      if (value < minTime) {
        const [mh, mm] = minTime.split(":");
        const { hour, period } = convertTo12Hour(Number(mh));
        setSelectedHour(String(hour).padStart(2, "0"));
        setSelectedMinute(mm);
        setSelectedPeriod(period);
        onChange(minTime); // auto-correct
      }
    }
  }, [value, minTime]);

  // Update selected hour/minute/period if input value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      const { hour, period } = convertTo12Hour(Number(h));
      setSelectedHour(String(hour).padStart(2, "0"));
      setSelectedMinute(m);
      setSelectedPeriod(period);
    }
  }, [value]);

  // Prevent scrolling to wrong hour/minute/period
  useEffect(() => {
    if (open && hoursRef.current) {
      const selected = hoursRef.current.querySelector(
        `div:nth-child(${Number(selectedHour)})`
      );
      selected?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [open, selectedHour]);

  useEffect(() => {
    if (open && minutesRef.current) {
      const selected = minutesRef.current.querySelector(
        `div:nth-child(${Number(selectedMinute) + 1})`
      );
      selected?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [open, selectedMinute]);

  useEffect(() => {
    if (open && periodRef.current) {
      const index = selectedPeriod === "AM" ? 1 : 2;
      const selected = periodRef.current.querySelector(
        `div:nth-child(${index})`
      );
      selected?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [open, selectedPeriod]);

  // -------- FIX 2: Prevent selecting hour < minHour -------
  const handleHourClick = (h: string) => {
    const hour24 = convertTo24Hour(Number(h), selectedPeriod);
    if (minHour !== null && hour24 < minHour) return; // block
    setSelectedHour(h);

    // If hour == minHour and minute < minMinute → fix minute
    if (
      minHour !== null &&
      hour24 === minHour &&
      Number(selectedMinute) < minMinute!
    ) {
      setSelectedMinute(String(minMinute).padStart(2, "0"));
    }
  };

  // -------- FIX 3: Prevent selecting minute < minMinute -------
  const handleMinuteClick = (m: string) => {
    const hour24 = convertTo24Hour(Number(selectedHour), selectedPeriod);
    if (
      minHour !== null &&
      hour24 === minHour &&
      Number(m) < minMinute!
    )
      return; // block
    setSelectedMinute(m);
  };

  // Handle period change
  const handlePeriodClick = (period: string) => {
    const newHour24 = convertTo24Hour(Number(selectedHour), period);
    
    // Check if new period creates invalid time
    if (minHour !== null) {
      if (newHour24 < minHour) return; // block
      if (newHour24 === minHour && Number(selectedMinute) < minMinute!) {
        setSelectedMinute(String(minMinute).padStart(2, "0"));
      }
    }
    
    setSelectedPeriod(period);
  };

  const handleNow = () => {
    const now = new Date();
    const h24 = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const { hour, period } = convertTo12Hour(h24);
    const h24String = String(h24).padStart(2, "0");

    // Prevent "Now" from selecting below minTime
    if (minTime && `${h24String}:${m}` < minTime) {
      onChange(minTime);
      const [mh, mm] = minTime.split(":");
      const { hour: minHour12, period: minPeriod } = convertTo12Hour(Number(mh));
      setSelectedHour(String(minHour12).padStart(2, "0"));
      setSelectedMinute(mm);
      setSelectedPeriod(minPeriod);
    } else {
      setSelectedHour(String(hour).padStart(2, "0"));
      setSelectedMinute(m);
      setSelectedPeriod(period);
      onChange(`${h24String}:${m}`);
    }
    setOpen(false);
  };

  const handleConfirm = () => {
    const hour24 = convertTo24Hour(Number(selectedHour), selectedPeriod);
    const finalTime = `${String(hour24).padStart(2, "0")}:${selectedMinute}`;

    // Prevent selecting invalid end time
    if (minTime && finalTime < minTime) {
      onChange(minTime);
    } else {
      onChange(finalTime);
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value ? formatDisplayTime(value) : ""}
            placeholder={placeholder || "Select time"}
            readOnly
            onClick={() => setOpen(true)}
            className={className}
          />
          <Clock
            className="absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="flex w-60 flex-col gap-2 overflow-visible p-2">
        <div className="flex gap-2">
          {/* Hour Column */}
          <div
            className="h-40 flex-1 overflow-y-auto scroll-smooth rounded border"
            ref={hoursRef}
            onWheel={(e) => e.currentTarget.scrollBy({ top: e.deltaY })}
          >
            {hours.map((h) => {
              const hour24 = convertTo24Hour(Number(h), selectedPeriod);
              const isDisabled = minHour !== null && hour24 < minHour;
              
              return (
                <div
                  key={h}
                  className={`cursor-pointer p-2 text-center 
                    ${h === selectedHour ? "bg-blue-500 text-white" : ""}
                    ${isDisabled ? "opacity-30 pointer-events-none" : ""}
                  `}
                  onClick={() => handleHourClick(h)}
                >
                  {h}
                </div>
              );
            })}
          </div>

          {/* Minute Column */}
          <div
            className="h-40 flex-1 overflow-y-auto scroll-smooth rounded border"
            ref={minutesRef}
            onWheel={(e) => e.currentTarget.scrollBy({ top: e.deltaY })}
          >
            {minutes.map((m) => (
              <div
                key={m}
                className={`cursor-pointer p-2 text-center 
                  ${m === selectedMinute ? "bg-blue-500 text-white" : ""}
                `}
                onClick={() => handleMinuteClick(m)}
              >
                {m}
              </div>
            ))}
          </div>

          {/* AM/PM Column */}
          <div
            className="h-40 flex-1 overflow-y-auto scroll-smooth rounded border"
            ref={periodRef}
            onWheel={(e) => e.currentTarget.scrollBy({ top: e.deltaY })}
          >
            {periods.map((period) => {
              const hour24 = convertTo24Hour(Number(selectedHour), period);
              const isDisabled = minHour !== null && hour24 < minHour;
              
              return (
                <div
                  key={period}
                  className={`cursor-pointer p-2 text-center 
                    ${period === selectedPeriod ? "bg-blue-500 text-white" : ""}
                    ${isDisabled ? "opacity-30 pointer-events-none" : ""}
                  `}
                  onClick={() => handlePeriodClick(period)}
                >
                  {period}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-2 flex justify-between">
          <Button size="sm" variant="outline" onClick={handleNow}>
            Now
          </Button>
          <Button size="sm" onClick={handleConfirm}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
