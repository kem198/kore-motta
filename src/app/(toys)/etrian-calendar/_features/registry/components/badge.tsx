import { ETRIAN_CALENDAR_CLASS_BY_MONTH } from "@/app/(toys)/etrian-calendar/_common/constants/color";
import { etrianNewYearsEve } from "@/app/(toys)/etrian-calendar/_common/constants/date";
import { type EtrianDateOfBirth } from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Cake, House } from "lucide-react";

type DateOfBirthBadgeProps = {
  dateOfBirth?: EtrianDateOfBirth;
} & BadgeProps;

export function DateOfBirthBadge({
  dateOfBirth,
  className,
  ...props
}: DateOfBirthBadgeProps) {
  const colorClass =
    ETRIAN_CALENDAR_CLASS_BY_MONTH[dateOfBirth?.month ?? "default"];
  return (
    <Badge
      className={cn(
        "flex items-center gap-1 rounded-full whitespace-nowrap",
        colorClass,
        className,
      )}
      {...props}
    >
      <Cake strokeWidth={1.5} size={14} />

      {/*
      誕生日の設定内容によって次のいずれかで出力する
      - 皇帝ノ月 1 日
      - 鬼乎ノ日
      - 未設定
      */}
      {(() => {
        if (!dateOfBirth) return <>未設定</>;

        const { month, day } = dateOfBirth;
        return (
          <>
            {month}
            {day != null && month !== etrianNewYearsEve.name && <> {day} 日</>}
          </>
        );
      })()}
    </Badge>
  );
}

type AffiliationBadgeProps = {
  affiliation: string;
} & BadgeProps;

export function AffiliationBadge({
  affiliation,
  className,
  ...props
}: AffiliationBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 rounded-full font-normal whitespace-nowrap"
      {...props}
    >
      <House strokeWidth={1.5} size={12} />
      <span>{affiliation}</span>
    </Badge>
  );
}
