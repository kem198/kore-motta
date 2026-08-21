export const CURRENT_ETRIAN_REGISTRY_VERSION = 2 as const;

export const etrianMonths = [
  {
    name: "皇帝ノ月",
    kana: "こうていのつき",
  },
  {
    name: "笛鼠ノ月",
    kana: "ふえねずみのつき",
  },
  {
    name: "天牛ノ月",
    kana: "てんぎゅうのつき",
  },
  {
    name: "王虎ノ月",
    kana: "おうこのつき",
  },
  {
    name: "素兎ノ月",
    kana: "すうさぎのつき",
  },
  {
    name: "虹竜ノ月",
    kana: "にじりゅうのつき",
  },
  {
    name: "白蛇ノ月",
    kana: "しろへびのつき",
  },
  {
    name: "風馬ノ月",
    kana: "ふうまのつき",
  },
  {
    name: "金羊ノ月",
    kana: "きんようのつき",
  },
  {
    name: "飛猴ノ月",
    kana: "ひろうのつき",
  },
  {
    name: "火鳥ノ月",
    kana: "かちょうのつき",
  },
  {
    name: "戌神ノ月",
    kana: "いぬがみのつき",
  },
  {
    name: "怒猪ノ月",
    kana: "どちょのつき",
  },
] as const;

export const etrianNewYearsEve = {
  name: "鬼乎ノ日",
  kana: "ものかのひ",
} as const;

export const etrianMonthOptions = [
  ...etrianMonths.map((month) => month.name),
  etrianNewYearsEve.name,
] as const;

export const etrianDays = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28,
] as const;

export const etrianDayOptions = etrianDays.map(String);

export const MONOKA_DAY_OPTION = "1" as const;
