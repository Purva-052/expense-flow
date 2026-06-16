import React, { useEffect, useState } from "react";

export const AnalogClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Angle calculations
  const secondAngle = seconds * 6; // 360/60
  const minuteAngle = minutes * 6 + seconds * 0.1; // 360/60 + fractional seconds
  const hourAngle = (hours % 12) * 30 + minutes * 0.5; // 360/12 + fractional minutes

  // Number positions (12 numbers around a circle)
  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-950/80 shadow-md">
      {/* Clock numbers */}
      {numbers.map((num, idx) => {
        const angle = (idx * 30 * Math.PI) / 180;
        const radius = 34; // distance from center in px
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;

        return (
          <span
            key={num}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            className="absolute text-[8px] font-semibold text-zinc-400"
          >
            {num}
          </span>
        );
      })}

      {/* Clock hands */}
      {/* Hour Hand */}
      <div
        style={{
          transform: `rotate(${hourAngle}deg)`,
          transformOrigin: "bottom center",
        }}
        className="absolute bottom-1/2 left-[calc(50%-1px)] h-6 w-[2px] rounded-full bg-zinc-200 transition-transform duration-100 ease-out"
      />

      {/* Minute Hand */}
      <div
        style={{
          transform: `rotate(${minuteAngle}deg)`,
          transformOrigin: "bottom center",
        }}
        className="absolute bottom-1/2 left-[calc(50%-1px)] h-8 w-[1.5px] rounded-full bg-zinc-300 transition-transform duration-100 ease-out"
      />

      {/* Second Hand */}
      <div
        style={{
          transform: `rotate(${secondAngle}deg)`,
          transformOrigin: "bottom center",
        }}
        className="absolute bottom-[calc(50%-3px)] left-[calc(50%-0.5px)] h-9 w-[1px] bg-red-500 transition-transform duration-100 ease-out"
      />

      {/* Center Pin */}
      <div className="absolute h-1.5 w-1.5 rounded-full bg-red-500 border border-zinc-950" />
    </div>
  );
};
