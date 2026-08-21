"use client";

import { etrianNewYearsEve } from "@/app/(toys)/etrian-calendar/_common/constants/date";
import { toEtrianDate } from "@/app/(toys)/etrian-calendar/_common/utils/etrian-utils";

function TodaysEtrianDateDisplay() {
  const today = new Date();
  const todaysEtrianDate = toEtrianDate(today);
  const isEtrianNewYearsEve =
    todaysEtrianDate.month.name === etrianNewYearsEve.name;

  return (
    <p className="flex items-end gap-1">
      <span>本日は</span>
      <span
        className={`mt-0 font-bold ${isEtrianNewYearsEve && "text-pink-700"}`}
      >
        <ruby>
          {todaysEtrianDate.month.name}
          <rt className="font-normal">{todaysEtrianDate.month.kana}</rt>
        </ruby>
        {`${todaysEtrianDate.month.name !== etrianNewYearsEve.name ? ` ${todaysEtrianDate.day} 日` : ""}`}
      </span>
      <span>です！{isEtrianNewYearsEve && "よいお年を！"}</span>
    </p>
  );
}

export { TodaysEtrianDateDisplay };
