"use client";

import { etrianMonthOptions } from "@/app/(toys)/etrian-calendar/_common/constants/date";
import {
  EtrianDay,
  EtrianMonthName,
} from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import {
  toEtrianDate,
  toSolarDate,
} from "@/app/(toys)/etrian-calendar/_common/utils/etrian-utils";
import { ResultDisplay } from "@/components/shared/result-display";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Item, ItemContent } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isLeapYear } from "@/utilities/date-utils";
import { format } from "date-fns";
import {
  ArrowDownUp,
  ArrowRightLeft,
  ChevronDownIcon,
  Sprout,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";

export function ToEtrianCalendarConverter({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  const startMonth = new Date(2007, 0);
  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 4, 11);

  return (
    <ItemContent className="flex flex-col flex-wrap gap-4 md:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="date" className="flex items-center gap-1">
          <Sun size={16} />
          太陽暦
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-full justify-between font-normal"
            >
              {date ? format(date, "yyyy-MM-dd") : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={date}
              defaultMonth={date}
              startMonth={startMonth}
              endMonth={endMonth}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <Label className="flex items-center gap-1">
          <Sprout size={16} />
          世界樹暦
        </Label>
        <div>
          <ResultDisplay className="w-full justify-between">
            {date ? toEtrianDate(date).month.name : ""}{" "}
            {date && toEtrianDate(date).day
              ? `${toEtrianDate(date).day} 日`
              : ""}
          </ResultDisplay>
        </div>
      </div>
    </ItemContent>
  );
}

export function ToSolarCalendarConverter({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}) {
  const today = new Date();
  const currentEtrianDate = date ? toEtrianDate(date) : toEtrianDate(today);

  const [selectedYear, setSelectedYear] = useState<string>(
    String(date?.getFullYear() || today.getFullYear()),
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    currentEtrianDate.month.name,
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    String(currentEtrianDate.day),
  );

  useEffect(() => {
    if (date) {
      // 引き継いできた date を世界樹歴用に詰め替える
      const etrianDate = toEtrianDate(date);
      setSelectedYear(String(date.getFullYear()));
      setSelectedMonth(etrianDate.month.name);
      setSelectedDay(String(etrianDate.day));
    }
  }, [date]);

  let maxDay = 28;

  // 鬼乎ノ日の場合、選択肢を平年は 1 日、閏年は 1, 2 日にする
  const isNewYearsEve = selectedMonth === "鬼乎ノ日";
  const isLeap = isLeapYear(new Date(parseInt(selectedYear, 10), 0, 1));
  if (isNewYearsEve) {
    maxDay = isLeap ? 2 : 1;
  }

  // 年の選択肢
  const startYear = 2007;
  const endYear = today.getFullYear() + 4;
  // 期間中に含む年の配列を生成する
  const yearOptions = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  useEffect(() => {
    // 鬼乎ノ日が選択されたとき用の useEffect ブロック
    if (isNewYearsEve) {
      const currentDay = parseInt(selectedDay, 10);
      // 鬼乎ノ日が選択されたら選択中の日を 1 日にする
      if (isLeap) {
        if (currentDay > 2) {
          // 閏年では 3 日以上の時のみ発火する (2 日から変更できなくなるため)
          setSelectedDay("1");
        }
      } else {
        setSelectedDay("1");
      }
    }
  }, [isNewYearsEve, isLeap, selectedDay]);

  useEffect(() => {
    // 選択した日付を監視して更新する useEffect ブロック
    // 未入力項目など異常値は早期リターンして undefined を詰める
    if (!selectedYear || !selectedMonth || !selectedDay) {
      setDate(undefined);
      return;
    }

    try {
      const year = parseInt(selectedYear, 10);
      const day = parseInt(selectedDay, 10);
      if (Number.isNaN(year) || Number.isNaN(day) || day < 1 || day > maxDay) {
        setDate(undefined);
        return;
      }

      const calculatedDate: Date = toSolarDate({
        year,
        month: selectedMonth as EtrianMonthName,
        day: day as EtrianDay,
      });
      setDate(calculatedDate);
    } catch {
      setDate(undefined);
    }
  }, [selectedYear, selectedMonth, selectedDay, maxDay, setDate]);

  return (
    <ItemContent className="flex flex-col flex-wrap gap-4 md:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="etrian-month" className="flex items-center gap-1">
          <Sprout size={16} />
          世界樹暦
        </Label>
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="etrian-year" className="w-full">
                <SelectValue placeholder="年" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            年
          </div>

          <div className="flex flex-1 items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="etrian-month" className="w-full">
                <SelectValue placeholder="月を選択" />
              </SelectTrigger>
              <SelectContent>
                {etrianMonthOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-1 items-center gap-2">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger id="etrian-day" className="w-full">
                <SelectValue placeholder="日" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            日
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <Label className="flex items-center gap-1">
          <Sun size={16} />
          太陽暦
        </Label>
        <ResultDisplay className="w-full justify-between">
          {date ? format(date, "yyyy-MM-dd") : "日付を選択してください"}
        </ResultDisplay>
      </div>
    </ItemContent>
  );
}

export function SolarEtrianCalendarConverter() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isShowToEtrian, setIsShowToEtrian] = useState(true);

  return (
    <div className="flex flex-col items-end gap-2">
      <Item variant="outline" className="w-full">
        {isShowToEtrian ? (
          <ToEtrianCalendarConverter date={date} setDate={setDate} />
        ) : (
          <ToSolarCalendarConverter date={date} setDate={setDate} />
        )}
      </Item>

      <Button
        variant="secondary"
        onClick={() => {
          setIsShowToEtrian(!isShowToEtrian);
        }}
      >
        <ArrowDownUp className="block md:hidden" />
        <ArrowRightLeft className="hidden md:block" />
        入れ替える
      </Button>
    </div>
  );
}
