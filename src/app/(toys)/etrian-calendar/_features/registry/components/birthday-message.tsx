import { Etrian } from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import {
  getDiffDaysBetweenSolarAndEtrianDate,
  toEtrianDate,
} from "@/app/(toys)/etrian-calendar/_common/utils/etrian-utils";

type BirthdayMessageProps = { etrian: Etrian };

export function BirthdayMessage({ etrian }: BirthdayMessageProps) {
  const birth = etrian.dateOfBirth;
  if (!birth) return null;

  const today = new Date();
  const todaysEtrian = toEtrianDate(today);
  const isSameMonth = birth.month === todaysEtrian.month.name;
  const isSameDay = birth.day === todaysEtrian.day;

  if (
    (isSameMonth && todaysEtrian.month.name === "鬼乎ノ日") ||
    (isSameMonth && isSameDay)
  ) {
    return (
      <span className="text-xs text-red-400">🎉お誕生日です！おめでとう！</span>
    );
  }

  const diffDays = getDiffDaysBetweenSolarAndEtrianDate(today, {
    month: birth.month,
    day: birth.day,
  });

  if (diffDays === null) return null;

  if (isSameMonth && diffDays <= 30) {
    return (
      <span className="text-xs text-red-400">{`今月はお誕生月です！あと ${diffDays} 日！`}</span>
    );
  }

  if (isSameMonth && diffDays > 30) {
    return (
      <span className="text-xs text-muted-foreground">
        今月はお誕生月でした！また来年！
      </span>
    );
  }

  if (diffDays >= 1 && diffDays <= 30) {
    return (
      <span className="text-xs text-red-400">{`あと ${diffDays} 日でお誕生日です！`}</span>
    );
  }

  return null;
}
