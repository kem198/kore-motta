import { CURRENT_ETRIAN_REGISTRY_VERSION } from "@/constants/version";

export type Etrian = {
  id: string;
  name: string;
  order: number;
  memo?: string;
};

export type EtrianRegistryVersion = typeof CURRENT_ETRIAN_REGISTRY_VERSION | 1;

export type EtrianRegistry = {
  version: EtrianRegistryVersion;
  etrians: Etrian[];
};
