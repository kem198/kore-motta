import {
  etrianMonths,
  etrianNewYearsEve,
} from "@/app/(toys)/etrian-calendar/_common/constants/date";
import {
  EtrianDay,
  EtrianMonthName,
  EtrianMonthNameKana,
  EtrianNewYearsEveName,
  EtrianNewYearsEveNameKana,
} from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import { MILLISECONDS_PER_DAY } from "@/constants/date";
import { isLeapYear } from "@/utilities/date-utils";

/**
 * 太陽暦を世界樹歴へ変換する
 */
export const toEtrianDate = (
  date: Date,
): {
  month: {
    name: EtrianMonthName | EtrianNewYearsEveName;
    kana: EtrianMonthNameKana | EtrianNewYearsEveNameKana;
  };
  day: EtrianDay;
} => {
  // (a) 与えられた Date が存在する年初の時刻 (Unix epoch time) を取る
  // e.g. 2025-01-01 00:00:00 GMT+0900 (Japan Standard Time) ⇒ 1735657200000
  const startOfYearTime = new Date(date.getFullYear(), 0, 1).getTime();

  // (b) 与えられた Date から変換対象日の時刻 (Unix epoch time) を取る
  // e.g. 2025-03-26 00:00:00 GMT+0900 (Japan Standard Time) ⇒ 1742914800000
  const targetTime = date.getTime();

  // (a) 年初の時刻 から (b) 変換対象日の時刻 までの 経過ミリ秒 (c) を取る
  // e.g. (b) 1742914800000 - (a) 1735657200000 ⇒ (c) 7257600000
  const elapsedMilliseconds = targetTime - startOfYearTime;

  // (c) 経過ミリ秒 を 1 日分のミリ秒数で割り、小数点以下を切り捨てる ⇒ 経過日数の整数値が取れる
  // e.g. 84
  const elapsedDays = Math.floor(elapsedMilliseconds / MILLISECONDS_PER_DAY);

  // 1 オリジンにしたいので経過日数 + 1 する
  // e.g. 85 ←ここで日数が判明した
  const dayOfYear = elapsedDays + 1;

  // 大晦日の判定
  if (dayOfYear === 365) {
    return { month: etrianNewYearsEve, day: 1 };
  }

  // 大晦日 (閏年) の判定
  if (dayOfYear === 366) {
    return { month: etrianNewYearsEve, day: 2 };
  }

  // 大晦日以外は etrianMonths の配列に割り当てる
  // e.g. 85 ⇒  (28 * 3 + 1) ⇒ 王虎ノ月 1 日
  const monthIndex = Math.floor((dayOfYear - 1) / 28);
  const day = ((dayOfYear - 1) % 28) + 1;
  return { month: etrianMonths[monthIndex], day: day as EtrianDay };
};

/**
 * 世界樹暦を太陽歴へ変換する
 */
export const toSolarDate = ({
  year,
  month,
  day,
}: {
  year: number;
  month: EtrianMonthName | EtrianNewYearsEveName;
  day: EtrianDay;
}): Date => {
  if (month === etrianNewYearsEve.name) {
    if (!isLeapYear(new Date(year, 0, 1))) {
      return new Date(year, 11, 31);
    }

    if (day === 1) {
      return new Date(year, 11, 30);
    }

    if (day === 2) {
      return new Date(year, 11, 31);
    }

    throw new Error("Invalid day specified for 鬼乎ノ日 (must be 1 or 2)");
  }

  const monthIndex = etrianMonths.findIndex(
    (etrianMonth) => etrianMonth.name === month,
  );
  if (monthIndex === -1) {
    throw new Error(`Unknown Etrian month: ${month}`);
  }

  // 各月の開始日は「28 * (その月の index) + 1」日目
  // e.g. 王虎ノ月 1 日 (28 * 3 + 1) ⇒ 85
  const dayOfYear = monthIndex * 28 + day;

  return new Date(year, 0, dayOfYear);
};

/**
 * 太陽歴と世界樹歴の日数差を返す
 */
export const getDiffDaysBetweenSolarAndEtrianDate = (
  solarDate: Date,
  etrianDate: {
    month: EtrianMonthName | EtrianNewYearsEveName;
    day: EtrianDay;
  },
): number | null => {
  const solarDateMidnight = new Date(
    solarDate.getFullYear(),
    solarDate.getMonth(),
    solarDate.getDate(),
  );

  try {
    let targetEtrianDate = toSolarDate({
      year: solarDateMidnight.getFullYear(),
      month: etrianDate.month,
      day: etrianDate.day,
    });

    if (targetEtrianDate.getTime() < solarDateMidnight.getTime()) {
      targetEtrianDate = toSolarDate({
        year: solarDateMidnight.getFullYear() + 1,
        month: etrianDate.month,
        day: etrianDate.day,
      });
    }

    const diff = Math.ceil(
      (targetEtrianDate.getTime() - solarDateMidnight.getTime()) /
        MILLISECONDS_PER_DAY,
    );
    return diff >= 0 ? diff : null;
  } catch {
    return null;
  }
};
