import { type SelectStatistics } from "~/schema/statistics";
import { type ConvertToAllString, type dictionary } from "./type";
import { type SelectModifiersList } from "~/schema/modifiers_list";

const modifiersList: ConvertToAllString<SelectModifiersList> = {
  modifiers: "Modifiers",
  name:"Name",
  id: "ID"
}
const statistics: ConvertToAllString<SelectStatistics> = {
  id: "ID",
  usageTimestamps: "UsageTimestamps",
  viewTimestamps: "ViewTimestamps",
  rates: "Rates",
  monsterId: "",
  crystalId: "",
  mainWeaponId: "",
  subWeaponId: "",
  bodyArmorId: "",
  additionalEquipmentId: "",
  specialEquipmentId: "",
  skillId: "",
  petId: "",
  consumableId: "",
  characterId: "",
  analyzerId: ""
};

const dictionary: dictionary = {
  ui: {
    columnsHidden: "Columns Hidden",
    searchPlaceholder: "Search something ~",
    actions: {
      add: "Add",
      create: "Create",
      remove: "Remove",
      update: "Update",
      open: "Open",
      upload: "Upload",
      reset: "Reset",
      save: "Save",
      modify: "Modify",
      cancel: "Cancel",
      close: "close",
      back: "Back",
      filter: "Filter",
    },
    nav: {
      home: "Home",
      monsters: "Monsters",
      skills: "Skills",
      equipments: "Equipments",
      crystals: "Crystas",
      pets: "Pets",
      items: "Items",
      character: "Character",
      comboAnalyze: "Combo",
    },
    errorPage: {
      tips: "You have no knowledge of the desert. Click the screen to return",
    },
    settings: {
      title: "Settings",
      userInterface: {
        title: "User Interface",
        isAnimationEnabled: {
          title: "Enable Animation",
          description: "Will affect the duration of transitions and animations on all pages.",
        }
      },
      language: {
        title: "Language",
        selectedLanguage: {
          title: "Select Language",
          description: "Affects all interface texts, but cannot change data class texts.",
          zhCN: "简体中文",
          zhTW: "繁体中文",
          enUS: "English",
          jaJP: "日本語"
        }
      },
      statusAndSync: {
        title: "Status and Sync",
        restorePreviousStateOnStartup: {
          title: "Restore Previous State on Startup",
          description: "Not implemented yet.",
        },
        syncStateAcrossClients: {
          title: "Sync State Across Clients",
          description: "Not implemented yet.",
        }
      },
      privacy: {
        title: "Privacy",
        postVisibility: {
          title: "Post Visibility",
          description: "Post Visibility includes: Character, Monstors, Crystas, Main Weapon, Sub Weapon, Body Armor, Additional Equipment, Special Equipment, Skills, Consumables, Combo, Analyzer.",
          everyone: "Everyone",
          friends: "Friends",
          onlyMe: "Only Me"
        }
      },
      messages: {
        title: "Messages",
        notifyOnContentChange: {
          title: "Notify on Content Change",
          description: "Not implemented yet.",
          notifyOnReferencedContentChange: "Notify on Referenced Content Change",
          notifyOnLike: "Notify on Like",
          notifyOnBookmark: "Notify on Bookmark"
        }
      },
      about: {
        title: "About",
        description: {
          title: "Description",
          description: "~~~~~~~~~~~",
        },
        version: {
          title: "Version",
          description: "0.0.1-alpha",
        }
      }
    },
    index: {
      adventurer: "Adventurer",
      goodMorning: "Good Morning ~",
      goodAfternoon: "Good Afternoon ~",
      goodEvening: "Good Evening ~",
      nullSearchResultWarring: "Can not find anything!",
      nullSearchResultTips: "Emmm..."
    },
    monster: {
      pageTitle: "Monster",
      table: {
        title: "Monsters Table",
        description: "Emmm..............",
      },
      news: {
        title: "Recently Updated",
      },
      augmented: "Show All Stars",
      canNotModify: "System Generated",
      monsterDegreeOfDifficulty: {
        0: "☆☆☆☆",
        1: "★☆☆☆",
        2: "★★☆☆",
        3: "★★★☆",
        4: "★★★★",
      },
      monsterForm: {
        description:
          "When uploading fixed-point boss data, please use one-star data, and the system will automatically calculate the data for other star levels according to the rules.",
      },
    },
    crystal: {
      pageTitle: "Crystal",
      description: "Emmm..............",
      canNotModify: "System Generated",
      crystalForm: {
        description: "Emmm..............",
      }
    },
    skill: {
      pageTitle: "Skill",
      description: "Emmm..............",
    },
    analyze: {
      pageTitle: "Analyzer",
      description: "Emmm..............",
      modifiers: "Modifiers",
      dialogData: {
        lv: "Lv",
        mainWeapon: {
          type: "Type",
          baseAtk: "BaseAtk",
          refinement: "Refinement",
          stability: "Stability",
        },
        subWeapon: {
          type: "Type",
          baseAtk: "BaseAtk",
          refinement: "Refinement",
          stability: "Stability",
        },
        bodyArmor: {
          type: "Type",
          baseDef: "BaseDef",
          refinement: "Refinement",
        },
        str: "Str",
        int: "Int",
        vit: "Vit",
        agi: "Agi",
        dex: "Dex",
        luk: "Luk",
        cri: "Cri",
        tec: "Tec",
        men: "Men",
        pPie: "p-Pie",
        mPie: "m-Pie",
        pStab: "p-Stab",
        nDis: "n-Dis",
        fDis: "f-Dis",
        crT: "Cr-T",
        cdT: "Cd-T",
        weaponPatkT: "Wea-pAtk-T",
        weaponMatkT: "Wea-mAtk-T",
        unsheatheAtk: "Unsheathe-Atk",
        stro: "Stro",
        total: "Total",
        final: "Final",
        am: "Am",
        cm: "Cm",
        aggro: "Aggro",
        maxHp: "MaxHP",
        maxMp: "MaxMp",
        pCr: "p-Cr",
        pCd: "p-Cd",
        mainWeaponAtk: "MainWeaponAtk",
        subWeaponAtk: "SubWeaponAtk",
        weaponAtk: "WeaponAtk",
        pAtk: "p-Atk",
        mAtk: "m-Atk",
        aspd: "Aspd",
        cspd: "Cspd",
        ampr: "Ampr",
        hp: "Hp",
        mp: "Mp",
        name: "Name",
        pDef: "p-Def",
        pRes: "p-Res",
        mDef: "m-Def",
        mRes: "m-Res",
        cRes: "c-Res",
        index: "Index",
        skillEffectType: "",
        actionFixedDuration: "action-FixedDuration",
        actionModifiableDuration: "action-ModifiableDuration",
        chantingFixedDuration: "chanting-FixedDuration",
        chantingModifiableDuration: "chanting-ModifiableDuration",
        chargingFixedDuration: "charging-FixedDuration",
        chargingModifiableDuration: "charging-ModifiableDuration",
        skillChargingFrames: "ChargingFrames",
        skillActionFrames: "ActionFrames",
        skillChantingFrames: "ChantingFrames",
        skillDuration: "Duration",
        skillStartupFrames: "StartupFrames",
        anticipate: "",
        vMatk: "v-mAtk",
        vPatk: "v-pAtk",
      },
      actualValue: "Actual",
      baseValue: "Base",
      staticModifiers: "StaticModifiers",
      dynamicModifiers: "DynamicModifiers",
    },
    character: {
      pageTitle: "Skill",
      description: "Emmm..............",
    },
  },
  db: {
    enums: {
      MonsterType: {
        COMMON_BOSS: "Common Boss",
        COMMON_MINI_BOSS: "Common mini Boss",
        COMMON_MOBS: "Common Mobs",
        EVENT_BOSS: "Event Boss",
        EVENT_MINI_BOSS: "Event mini Boss",
        EVENT_MOBS: "Event Mobs",
      },
      Element: {
        NO_ELEMENT: "No-Element",
        DARK: "Dark",
        EARTH: "Earth",
        FIRE: "Fire",
        LIGHT: "Light",
        WATER: "Water",
        WIND: "Wind",
      },
      SpecialAbiType: {
        NULL: "Null",
        LUK: "Luk",
        CRI: "Cri",
        TEC: "Tec",
        MEN: "Men",
      },
      MainWeaponType: {
        NO_WEAPON: "no-weapon",
        ONE_HAND_SWORD: "one-hand-sword",
        TWO_HANDS_SWORD: "two-hands-sword",
        BOW: "bow",
        STAFF: "staff",
        MAGIC_DEVICE: "magic-device",
        KNUCKLE: "knuckle",
        HALBERD: "halberd",
        KATANA: "katana",
        BOWGUN: "bowgun",
      },
      SubWeaponType: {
        NO_WEAPON: "no-weapon",
        ONE_HAND_SWORD: "one-hand-sword",
        MAGIC_DEVICE: "magic-device",
        KNUCKLE: "knuckle",
        KATANA: "katana",
        ARROW: "arrow",
        DAGGER: "dagger",
        NINJUTSUSCROLL: "ninjutsu-scroll",
        SHIELD: "shield",
      },
      BodyArmorType: {
        NORMAL: "Normal",
        LIGHT: "Light",
        HEAVY: "Heavy",
      },
      CrystalType: {
        GENERAL: "General",
        WEAPONCRYSTAL: "WeaponCrystal",
        BODYCRYSTAL: "BodyCrystal",
        ADDITIONALCRYSTAL: "AdditionalCrystal",
        SPECIALCRYSTAL: "SpecialCrystal",
      },
      SkillType: {
        ACTIVE_SKILL: "ActiveSkill",
        PASSIVE_SKILL: "PassiveSkill",
      },
      SkillTreeName: {
        BLADE: "Blade Skill",
        MAGIC: "Magic Skill",
        SHOT: "Shot Skill",
        MARTIAL: "Martial Skill",
        DUALSWORD: "DualSword Skill",
        HALBERD: "Halberd Skill",
        MONONOFU: "Mononofu Skill",
        CRUSHER: "Crusher Skill",
        SPRITE: "Sprite Skill",
      },
      UserRole: {
        USER: "User",
        ADMIN: "Admin",
      },
      WeaponElementDependencyType: {
        TRUE: "yes",
        FALSE: "no",
      },
      ComboType: {
        NULL: "Null",
      },
      YieldType: {
        ImmediateEffect: "ImmediateEffect",
        PersistentEffect: "PersistentEffect",
      },
      SkillExtraActionType: {
        None: "None",
        Chanting: "Chanting",
        Charging: "Charging",
      },
      CharacterType: {
        Tank: "Tank",
        Mage: "",
        Ranger: "",
        Marksman: "",
      },
    },
    models: {
      monster: {
        id: "ID",
        name: "Name",
        monsterType: "Type",
        baseLv: "Lv",
        experience: "Exp",
        address: "Address",
        element: "Element",
        radius: "Radius",
        maxhp: "MaxHP",
        physicalDefense: "P-Def",
        physicalResistance: "P-Res",
        magicalDefense: "M-Def",
        magicalResistance: "M-Res",
        criticalResistance: "C-Res",
        avoidance: "Avo",
        dodge: "Dod",
        block: "Blo",
        normalAttackResistanceModifier: "N-ATK-Res-Mod",
        physicalAttackResistanceModifier: "P-ATK-Res-Mod",
        magicalAttackResistanceModifier: "M-ATK-Res-Mod",
        difficultyOfTank: "DifficultyOfTank",
        difficultyOfMelee: "DifficultyOfMelee",
        difficultyOfRanged: "DifficultyOfRanged",
        possibilityOfRunningAround: "PossibilityOfRunningAround",
        extraDetails: "SpecialBehavior",
        dataSources: "DataSources",
        createdByUserId: "CreatedByUserId",
        updatedByUserId: "UpdatedByUserId",
        createdAt: "CreatedAt",
        updatedAt: "UpdatedAt",
        statistics: statistics,
        statisticsId: "StatisticsId",
        imageId: "ImageId",
      },
      crystal: {
        modifiersList: modifiersList,
        id: "Id",
        name: "Name",
        crystalType: "crystalType",
        front: "Front",
        modifiersListId: "",
        extraDetails: "SpecialBehavior",
        dataSources: "DataSources",
        createdByUserId: "CreatedByUserId",
        updatedByUserId: "UpdatedByUserId",
        createdAt: "CreatedAt",
        updatedAt: "UpdatedAt",
        statistics: statistics,
        statisticsId: "StatisticsId",
      },
      skill: {
        id: "ID",
        name: "Name",
        skillType: "SkillType",
        skillTreeName: "TreeName",
        weaponElementDependencyType: "WEDT",
        element: "Element",
        skillEffect: "SkillEffect",
        skillDescription: "",
        extraDetails: "SpecialBehavior",
        dataSources: "DataSources",
        createdByUserId: "CreatedByUserId",
        updatedByUserId: "UpdatedByUserId",
        createdAt: "CreatedAt",
        updatedAt: "UpdatedAt",
        statistics: statistics,
        statisticsId: "StatisticsId",
      },
      user: {
        id: "ID",
        name: "Name",
        email: "Email",
        emailVerified: "EmailVerified",
        image: "Image",
        userRole: "Role",
      },
      skillEffect: {
        skillCost: "SkillCost",
        skillYield: "SkillYield",
        id: "ID",
        condition: "Condition",
        actionBaseDurationFormula: "ActionBaseDuration",
        actionModifiableDurationFormula: "ActionModifiableDuration",
        skillExtraActionType: "",
        chargingBaseDurationFormula: "",
        chargingModifiableDurationFormula: "",
        chantingBaseDurationFormula: "ChantingBaseDurationFormula",
        chantingModifiableDurationFormula: "ChantingModifiableDurationFormula",
        skillStartupFramesFormula: "SkillStartupFramesFormula",
        belongToskillId: "BelongToskillId",
        description: "Description",
      },
      skillCost: {
        id: "ID",
        name: "Name",
        costFormula: "CostFormula",
        skillEffectId: "SkillEffectId",
      },
      skillYield: {
        id: "ID",
        name: "Name",
        yieldType: "YieldType",
        mutationTimingFormula: "MutationTimingFormula",
        yieldFormula: "YieldFormula",
        skillEffectId: "SkillEffectId",
      },
      character: {
        id: "Id",
        name: "",
        lv: "",
        characterType: "",
        baseStr: "",
        baseInt: "",
        baseVit: "",
        baseAgi: "",
        baseDex: "",
        specialAbiType: "",
        specialAbiValue: "",
        mainWeapon: {
          crystal: "",
          id: "ID",
          name: "",
          mainWeaponType: "",
          baseAtk: "",
          refinement: "",
          stability: "",
          element: "",
          modifiersList: modifiersList,
          modifiersListId: "",
          extraDetails: "SpecialBehavior",
          dataSources: "DataSources",
          createdByUserId: "CreatedByUserId",
          updatedByUserId: "UpdatedByUserId",
          createdAt: "CreatedAt",
          updatedAt: "UpdatedAt",
          statistics: statistics,
          statisticsId: "StatisticsId",
        },
        mainWeaponId: "",
        subWeapon: {
          modifiersList: modifiersList,
          id: "ID",
          name: "",
          subWeaponType: "",
          baseAtk: "",
          refinement: "",
          stability: "",
          element: "",
          modifiersListId: "",
          extraDetails: "SpecialBehavior",
          dataSources: "DataSources",
          createdByUserId: "CreatedByUserId",
          updatedByUserId: "UpdatedByUserId",
          createdAt: "CreatedAt",
          updatedAt: "UpdatedAt",
          statistics: statistics,
          statisticsId: "StatisticsId",
        },
        subWeaponId: "",
        bodyArmor: {
          modifiersList: modifiersList,
          crystal: "",
          id: "ID",
          name: "",
          bodyArmorType: "",
          refinement: "",
          baseDef: "",
          modifiersListId: "",
          extraDetails: "SpecialBehavior",
          dataSources: "DataSources",
          createdByUserId: "CreatedByUserId",
          updatedByUserId: "UpdatedByUserId",
          createdAt: "CreatedAt",
          updatedAt: "UpdatedAt",
          statistics: statistics,
          statisticsId: "StatisticsId",
        },
        bodyArmorId: "",
        additionalEquipment: {
          modifiersList: modifiersList,
          crystal: "",
          id: "ID",
          name: "",
          refinement: "",
          modifiersListId: "",
          extraDetails: "SpecialBehavior",
          dataSources: "DataSources",
          createdByUserId: "CreatedByUserId",
          updatedByUserId: "UpdatedByUserId",
          createdAt: "CreatedAt",
          updatedAt: "UpdatedAt",
          statistics: statistics,
          statisticsId: "StatisticsId",
        },
        additionalEquipmentId: "",
        specialEquipment: {
          modifiersList: modifiersList,
          crystal: "",
          id: "ID",
          name: "",
          modifiersListId: "",
          extraDetails: "SpecialBehavior",
          dataSources: "DataSources",
          createdByUserId: "CreatedByUserId",
          updatedByUserId: "UpdatedByUserId",
          createdAt: "CreatedAt",
          updatedAt: "UpdatedAt",
          statistics: statistics,
          statisticsId: "StatisticsId",
        },
        specialEquipmentId: "",
        fashion: modifiersList,
        fashionModifiersListId: "",
        cuisine: modifiersList,
        CuisineModifiersListId: "",
        consumableList: "",
        skillList: "",
        combos: "",
        pet: {
          id: "ID",
          name: "",
          extraDetails: "SpecialBehavior",
          dataSources: "DataSources",
          createdByUserId: "CreatedByUserId",
          updatedByUserId: "UpdatedByUserId",
          createdAt: "CreatedAt",
          updatedAt: "UpdatedAt",
          statistics: statistics,
          statisticsId: "StatisticsId",
        },
        petId: "",
        modifiersList: modifiersList,
        modifiersListId: "",
        extraDetails: "SpecialBehavior",
        createdByUserId: "CreatedByUserId",
        updatedByUserId: "UpdatedByUserId",
        createdAt: "CreatedAt",
        updatedAt: "UpdatedAt",
        statistics: statistics,
        statisticsId: "StatisticsId",
        imageId: "ImageId",
      },
    },
  },
};

export default dictionary;