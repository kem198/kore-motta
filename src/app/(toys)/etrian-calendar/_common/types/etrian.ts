import {
  CURRENT_ETRIAN_REGISTRY_VERSION,
  etrianDays,
  etrianMonths,
  etrianNewYearsEve,
} from "@/app/(toys)/etrian-calendar/_common/constants/date";

export type EtrianMonthName = (typeof etrianMonths)[number]["name"];
export type EtrianMonthNameKana = (typeof etrianMonths)[number]["kana"];
export type EtrianMonthNameWithNewYearsEve =
  | EtrianMonthName
  | EtrianNewYearsEveName;
export type EtrianNewYearsEveName = (typeof etrianNewYearsEve)["name"];
export type EtrianNewYearsEveNameKana = (typeof etrianNewYearsEve)["kana"];

export type EtrianDay = (typeof etrianDays)[number];

export type EtrianDateOfBirth = {
  month: EtrianMonthNameWithNewYearsEve;
  day: EtrianDay;
};

export type EtrianV1 = {
  id: string;
  name: string;
  dateOfBirth: {
    month?: EtrianMonthNameWithNewYearsEve;
    day?: EtrianDay;
  };
  affiliations: string[];
  order: number;
  memo?: string;
};

export type Etrian = {
  id: string;
  name: string;
  dateOfBirth?: EtrianDateOfBirth;
  affiliations: string[];
  order: number;
  memo?: string;
};

export type EtrianRegistryVersion = typeof CURRENT_ETRIAN_REGISTRY_VERSION | 1;

export type EtrianRegistry = {
  version: EtrianRegistryVersion;
  etrians: Etrian[];
};
