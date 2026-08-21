import { Etrian } from "@/app/(toys)/etrian-calendar/_common/types/etrian";

export const sampleEtrians: Etrian[] = [
  {
    id: "sample-paladin",
    name: "ししょー",
    dateOfBirth: {
      month: "皇帝ノ月",
      day: 1,
    },
    affiliations: ["アトラス", "エトリア"],
    order: 0,
    memo: "ウルトラCだろう…私もそう思う",
  },
  {
    id: "sample-gunner",
    name: "ガン子",
    dateOfBirth: {
      month: "皇帝ノ月",
      day: 1,
    },
    affiliations: ["アトラス", "ハイ・ラガード"],
    order: 1,
    memo: "私のフィギュアで3倍売れる",
  },
  {
    id: "sample-medic",
    name: "メディ子",
    dateOfBirth: {
      month: "皇帝ノ月",
      day: 1,
    },
    affiliations: ["アトラス", "エトリア"],
    order: 2,
    memo: "ずうずうしい！",
  },
];
