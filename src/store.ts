import { createStore } from "solid-js/store";
import { Locale } from "~/locales/i18n";
import { type Mob } from "./repositories/mob";
import { type Crystal } from "./repositories/crystal";
import { type Skill } from "./repositories/skill";
import { type Character } from "./repositories/character";
import { type Simulator } from "./repositories/simulator";
import * as _ from "lodash-es";
import { type CustomPet } from "./repositories/customPet";
import { type DB } from "../db/clientDB/generated/kysely/kyesely";

export type FormSate = "CREATE" | "UPDATE" | "DISPLAY";

export type Store = {
  version: number;
  theme: "light" | "dark";
  settingsDialogState: boolean;
  resourcesLoaded: boolean;
  database: {
    inited: boolean;
    tableSyncState: Partial<Record<keyof DB, boolean>>;
  };
  settings: {
    userInterface: {
      isAnimationEnabled: boolean;
      is3DbackgroundDisabled: boolean;
    };
    hasDismissedPWAInstall: boolean;
    language: Locale;
    statusAndSync: {
      restorePreviousStateOnStartup: boolean;
      syncStateAcrossClients: boolean;
    };
    privacy: {
      postVisibility: "everyone" | "friends" | "onlyMe";
    };
    messages: {
      notifyOnContentChange: {
        notifyOnReferencedContentChange: boolean;
        notifyOnLike: boolean;
        notifyOnBookmark: boolean;
      };
    };
  };
  indexPage: {};
  wiki: {
    filterStr: string;
    mobPage: {
      augmented: boolean;
      mobId: string;
      mobList: Mob[];
      mobDialogState: boolean;
      mobFormState: FormSate;
      filterState: boolean;
    };
    petPage: {
      petId: String;
      petList: CustomPet[];
    };
    crystalPage: {
      crystalId: string;
      crystalList: Crystal[];
      crystalDialogState: boolean;
      crystalFormState: FormSate;
      filterState: boolean;
    };
    skillPage: {
      skillId: string;
      skillList: Skill[];
      skillDialogState: boolean;
      skillFormState: FormSate;
      filterState: boolean;
    };
  };
  characterPage: {
    characterId: string;
    characterList: Character[];
    characterDialogState: boolean;
    characterFormState: FormSate;
    filterState: boolean;
  };
  simulatorPage: {
    simulatorId: string;
    simulatorList: Simulator[];
    simulatorDialogState: boolean;
    simulatorFormState: FormSate;
    filterState: boolean;
  };
};

export const initialStore: Store = {
  version: 20250103,
  theme: "light",
  resourcesLoaded: false,
  database:{
    inited: false,
    tableSyncState: {
      account: false,
      account_create_data: false,
      account_update_data: false,
      image: false,
      mob: false,
      statistic: false,
      user: false,
    },
  },
  settings: {
    userInterface: {
      isAnimationEnabled: true,
      is3DbackgroundDisabled: false,
    },
    language: "zh-CN",
    hasDismissedPWAInstall: false,
    statusAndSync: {
      restorePreviousStateOnStartup: true,
      syncStateAcrossClients: true,
    },
    privacy: {
      postVisibility: "everyone",
    },
    messages: {
      notifyOnContentChange: {
        notifyOnReferencedContentChange: true,
        notifyOnLike: true,
        notifyOnBookmark: true,
      },
    },
  },
  settingsDialogState: false,
  indexPage: {},
  wiki: {
    filterStr: "",
    mobPage: {
      augmented: true,
      mobId: "defaultMobId",
      mobList: [],
      mobDialogState: false,
      mobFormState: "DISPLAY",
      filterState: false,
    },
    petPage: {
      petId: "",
      petList: [],
    },
    crystalPage: {
      crystalId: "defaultCrystalId",
      crystalList: [],
      crystalDialogState: false,
      crystalFormState: "CREATE",
      filterState: false,
    },
    skillPage: {
      skillId: "defaultSkillId",
      skillList: [],
      skillDialogState: false,
      skillFormState: "CREATE",
      filterState: false,
    },
  },
  characterPage: {
    characterId: "defaultCharacterId",
    characterList: [],
    characterDialogState: false,
    characterFormState: "CREATE",
    filterState: false,
  },
  simulatorPage: {
    simulatorId: "defaultSimulatorId",
    simulatorList: [],
    simulatorDialogState: false,
    simulatorFormState: "CREATE",
    filterState: false,
  },
};

let actStore: Store;

const safeParse = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn("本地存储数据解析失败，正在重置为默认配置:", error);
    return null;
  }
};

const getActStore = () => {
  console.log("store")
  if (!actStore) {
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const storage = localStorage.getItem("store");
      if (storage) {
        const oldStore = safeParse(storage) || {};
        const newStore = initialStore;

        // 排除版本信息
        const { version: oldVersion, ...oldStoreWithoutVersion } = oldStore;
        const { version: newVersion, ...newStoreWithoutVersion } = newStore;

        let mergedStore: Store;
        if (oldVersion && oldVersion === newVersion) {
          mergedStore = _.merge({}, newStore, oldStore);
        } else {
          mergedStore = _.merge({}, newStoreWithoutVersion, oldStoreWithoutVersion);
          mergedStore.version = newVersion;
          localStorage.setItem("store", JSON.stringify(mergedStore));
        }
        actStore = mergedStore;
      } else {
        console.log(performance.now(), "初始化本地配置");
        localStorage.setItem("store", JSON.stringify(initialStore));
        actStore = initialStore;
      }
    }
  }
  return actStore;
};

const [store, setStore] = createStore<Store>(getActStore());
export { store, setStore };
