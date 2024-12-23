import { type Statistics } from "~/repositories/statistics";
import { type ConvertToAllString, type dictionary } from "./type";
import { Image } from "~/repositories/image";

const statistics: ConvertToAllString<Statistics> = {
  id: "ID",
  rates: "评分",
  usageTimestamps: "被使用记录",
  viewTimestamps: "被查看记录",
  belongToMbId: "",
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
  simulatorId: "",
  selfName: "统计信息",
};

const image: ConvertToAllString<Image> = {
  id: "ID",
  dataUrl: "DataUrl",
  main_weaponId: "",
  sub_weaponId: "",
  body_armorId: "",
  additional_equipmentId: "",
  special_equipmentId: "",
  selfName: "图片",
};

const dictionary: dictionary = {
  ui: {
    searchPlaceholder: "这里是搜索框~",
    columnsHidden: "隐藏列",
    actions: {
      add: "添加",
      create: "创建",
      remove: "删除",
      update: "更新",
      open: "打开",
      upload: "上传",
      save: "保存",
      reset: "清空",
      modify: "修改",
      cancel: "取消",
      close: "关闭",
      back: "返回",
      filter: "过滤",
      generateImage: "生成图片",
      swap: "替换",
      zoomIn: "放大",
      zoomOut: "缩小",
      checkInfo: "查看详情",
    },
    nav: {
      home: "首页",
      mobs: "怪物",
      skills: "技能",
      equipments: "装备",
      crystals: "锻晶",
      pets: "宠物",
      items: "消耗品",
      character: "角色配置",
      simulator: "流程模拟",
    },
    errorPage: {
      tips: "你来到了没有知识的荒原~，点击屏幕返回",
    },
    settings: {
      title: "设置",
      userInterface: {
        title: "外观",
        isAnimationEnabled: {
          title: "开启动画与过渡效果",
          description: "将影响所有页面的过渡和动画效果持续时间。",
        },
        is3DbackgroundDisabled: {
          title: "开启3D效果",
          description: "可能会产生大量性能损耗，不推荐开启。",
        },
      },
      language: {
        title: "语言偏好",
        selectedLanguage: {
          title: "系统语言",
          description: "影响所有的界面文本，但是无法改变数据类文本。",
          zhCN: "简体中文",
          zhTW: "繁体中文",
          enUS: "English",
          jaJP: "日本語",
        },
      },
      statusAndSync: {
        title: "状态和同步",
        restorePreviousStateOnStartup: {
          title: "启动时恢复上一次的状态",
          description: "暂未实现。",
        },
        syncStateAcrossClients: {
          title: "同步所有客户端状态",
          description: "此配置仅当用户登录时生效，未登录时客户端不具有身份标识，无法同步。",
        },
      },
      privacy: {
        title: "隐私",
        postVisibility: {
          title: "作品可见性",
          description:
            "作品可见性包括：角色、怪物、锻晶、主武器、副武器、身体装备、追加装备、特殊装备、宠物、技能、消耗品、连击、分析器。",
          everyone: "所有人可见",
          friends: "仅好友可见",
          onlyMe: "仅自己可见",
        },
      },
      messages: {
        title: "消息通知",
        notifyOnContentChange: {
          title: "以下内容发生变化时通知我",
          description: "暂未实现。",
          notifyOnReferencedContentChange: "引用内容发生变化时",
          notifyOnLike: "收到赞时",
          notifyOnBookmark: "作品被收藏时",
        },
      },
      about: {
        title: "关于此应用",
        description: {
          title: "描述",
          description: "没想好怎么写。",
        },
        version: {
          title: "版本",
          description: "0.0.1-alpha",
        },
      },
    },
    index: {
      adventurer: "冒险者",
      goodMorning: "哦哈喵~ (=´ω｀=)",
      goodAfternoon: "下午好ヾ(=･ω･=)o",
      goodEvening: "晚上好(。-ω-)zzz",
      nullSearchResultWarring: "没有找到相关内容!!!∑(ﾟДﾟノ)ノ",
      nullSearchResultTips: "变强之旅总有艰险阻道，求知路上不免遍布荆棘\n但是这里没有\n搜索结果里没有就是没有",
    },
    mob: {
      pageTitle: "怪物",
      table: {
        title: "怪物表",
        description: "不是所有怪物一开始就是怪物，也不是所有怪物看起来都像怪物。",
      },
      news: {
        title: "最近更新",
      },
      augmented: "是否展示全部星级数据",
      canNotModify: "系统生成，不可修改",
      mobDegreeOfDifficulty: {
        0: "零星",
        1: "一星",
        2: "二星",
        3: "三星",
        4: "四星",
      },
      mobForm: {
        description: "上传定点boss数据时请使用一星数据，系统将按规则自动计算其余星级数据。",
      },
    },
    crystal: {
      pageTitle: "锻晶表",
      description: "正在开发中，请勿使用。",
      canNotModify: "系统生成，不可修改",
      crystalForm: {
        description: "阿拉啦",
      },
    },
    skill: {
      pageTitle: "技能信息表",
      description: "此页面正在开发中，请勿使用",
    },
    simulator: {
      pageTitle: "流程计算器",
      description: "正在开发中，请勿使用",
      modifiers: "加成项",
      dialogData: {
          selfName: "角色",
          lv: "等级",
          mainWeapon: {
            type: "主武器类型",
            baseAtk: "主武器基础攻击力",
            refinement: "主武器精炼值",
            stability: "主武器稳定率",
            selfName: "主武器",
          },
          subWeapon: {
            type: "副武器类型",
            baseAtk: "副武器基础攻击力",
            refinement: "副武器精炼值",
            stability: "副武器稳定率",
            selfName: "副武器",
          },
          bodyArmor: {
            type: "身体装备类型",
            baseDef: "身体装备基础防御力",
            refinement: "身体装备精炼值",
            selfName: "身体装备",
          },
          str: "力量",
          int: "智力",
          vit: "耐力",
          agi: "敏捷",
          dex: "灵巧",
          luk: "幸运",
          cri: "暴击",
          tec: "技巧",
          men: "异抗",
          pPie: "物理贯穿",
          mPie: "魔法贯穿",
          pStab: "物理稳定",
          sDis: "近距离威力",
          lDis: "远距离威力",
          crC: "法术暴击转化率",
          cdC: "法术爆伤转化率",
          weaponPatkT: "武器攻击转化率（物理）",
          weaponMatkT: "武器攻击转化率（魔法）",
          uAtk: "拔刀攻击",
          stro: {
            Light: "对光属性增强",
            Normal: "对无属性增强",
            Dark: "对暗属性增强",
            Water: "对水属性增强",
            Fire: "对火属性增强",
            Earth: "对地属性增强",
            Wind: "对风属性增强",
            selfName: "对属性增强列表",
          },
          total: "总伤害提升",
          final: "最终伤害提升",
          am: "行动速度",
          cm: "咏唱缩减",
          aggro: "仇恨值倍率",
          maxHp: "生命值上限",
          maxMp: "法力值上限",
          pCr: "物理暴击",
          pCd: "物理爆伤",
          mainWeaponAtk: "主武器攻击力",
          subWeaponAtk: "副武器攻击力",
          weaponAtk: "武器攻击力",
          pAtk: "物理攻击",
          mAtk: "魔法攻击",
          aspd: "攻击速度",
          cspd: "咏唱速度",
          ampr: "攻回",
          hp: "当前生命值",
          mp: "当前法力值",
          name: "名称",
          pDef: "物理防御",
          pRes: "物理抗性",
          mDef: "魔法防御",
          mRes: "魔法抗性",
          cRes: "暴击抗性",
          anticipate: "看穿",
          index: "序号",
          skillEffectType: "读条类型",
          actionFixedDuration: "动画固定帧",
          actionModifiableDuration: "动画可加速帧",
          skillActionFrames: "动画时长总值",
          chantingFixedDuration: "固定咏唱时长",
          chantingModifiableDuration: "可加速咏唱时长",
          skillChantingFrames: "咏唱时长总值",
          chargingFixedDuration: "固定蓄力时长",
          chargingModifiableDuration: "可加速蓄力时长",
          skillChargingFrames: "蓄力时长总值",
          skillDuration: "技能总耗时",
          skillStartupFrames: "技能前摇",
          vMatk: "有效攻击力（魔法）",
          vPatk: "有效物攻（物理）",
      },
      actualValue: "实际值",
      baseValue: "基础值",
      staticModifiers: "常态加成",
      dynamicModifiers: "临时加成",
      simulatorPage: {
        mobsConfig: {
          title: "目标怪物",
        },
        teamConfig: {
          title: "队伍配置",
        },
      },
    },
    character: {
      pageTitle: "机体表",
      description: "此页面正在开发中，请勿使用",
    },
  },
  db: {
    enums: {
      MobType: {
        COMMON_BOSS: "定点王",
        COMMON_MINI_BOSS: "野王",
        COMMON_MOBS: "小怪",
        EVENT_BOSS: "活动定点王",
        EVENT_MINI_BOSS: "活动野王",
        EVENT_MOBS: "活动小怪",
        selfName: "怪物类型",
      },
      Element: {
        Normal: "无属性",
        Dark: "暗属性",
        Earth: "地属性",
        Fire: "火属性",
        Light: "光属性",
        Water: "水属性",
        Wind: "风属性",
        selfName: "元素类型",
      },
      SpecialAbiType: {
        NOSPECIALABI: "无",
        LUK: "幸运",
        CRI: "暴击",
        TEC: "技巧",
        MEN: "异抗",
        selfName: "特殊能力值类型",
      },
      MainWeaponType: {
        NO_WEAPON: "空",
        ONE_HAND_SWORD: "单手剑",
        TWO_HANDS_SWORD: "双手剑",
        BOW: "弓",
        STAFF: "法杖",
        MAGIC_DEVICE: "魔导具",
        KNUCKLE: "拳套",
        HALBERD: "旋风枪",
        KATANA: "拔刀剑",
        BOWGUN: "弩",
        selfName: "主武器类型",
      },
      SubWeaponType: {
        NO_WEAPON: "空",
        ONE_HAND_SWORD: "单手剑",
        MAGIC_DEVICE: "魔导具",
        KNUCKLE: "拳套",
        KATANA: "拔刀剑",
        ARROW: "箭矢",
        DAGGER: "小刀",
        NINJUTSUSCROLL: "忍术卷轴",
        SHIELD: "盾牌",
        selfName: "副武器类型",
      },
      BodyArmorType: {
        NORMAL: "一般",
        Light: "轻化",
        HEAVY: "重化",
        selfName: "防具类型",
      },
      CrystalType: {
        GENERAL: "通用锻晶",
        WEAPONCRYSTAL: "武器锻晶",
        BODYCRYSTAL: "防具锻晶",
        ADDITIONALCRYSTAL: "追加锻晶",
        SPECIALCRYSTAL: "特殊锻晶",
        selfName: "锻晶类型",
      },
      SkillType: {
        ACTIVE_SKILL: "主动技能",
        PASSIVE_SKILL: "被动技能",
        selfName: "技能类型",
      },
      SkillTreeName: {
        BLADE: "剑系技能树",
        MAGIC: "魔法技能树",
        SHOT: "射击技能树",
        MARTIAL: "格斗技能树",
        DUALSWORD: "双剑技能树",
        HALBERD: "斧枪技能树",
        MONONOFU: "武士技能树",
        CRUSHER: "粉碎者技能树",
        SPRITE: "灵魂技能树",
        selfName: "技能树名称",
      },
      UserRole: {
        USER: "常规用户",
        ADMIN: "管理员",
        selfName: "用户角色",
      },
      YieldType: {
        ImmediateEffect: "即时效果（仅作用一次）",
        PersistentEffect: "持续型效果（在被删除前，一直有效）",
        selfName: "效果类型",
      },
      WeaponElementDependencyType: {
        EXTEND: "继承",
        UNEXTEND: "不继承",
        selfName: "是否继承武器元素属性",
      },
      ComboType: {
        NULL: "未设置",
        selfName: "连击类型",
      },
      SkillExtraActionType: {
        None: "无",
        Chanting: "咏唱",
        Charging: "蓄力",
        selfName: "技能额外动作类型",
      },
      CharacterType: {
        Tank: "坦克",
        Mage: "",
        Ranger: "",
        Marksman: "",
        selfName: "角色类型",
      },
      selfName: "枚举类型",
    },
    models: {
      mob: {
        id: "ID",
        name: "名称",
        mobType: "类型",
        baseLv: "等级",
        experience: "经验",
        address: "所在地址",
        element: "元素属性",
        radius: "半径",
        maxhp: "最大HP",
        physicalDefense: "物理防御",
        physicalResistance: "物理抗性",
        magicalDefense: "魔法防御",
        magicalResistance: "魔法抗性",
        criticalResistance: "暴击抗性",
        avoidance: "回避值",
        dodge: "闪躲率",
        block: "格挡率",
        normalAttackResistanceModifier: "一般惯性变动率",
        physicalAttackResistanceModifier: "物理惯性变动率",
        magicalAttackResistanceModifier: "魔法惯性变动率",
        difficultyOfTank: "难度：坦职",
        difficultyOfMelee: "难度：近战",
        difficultyOfRanged: "难度：远程",
        possibilityOfRunningAround: "好动程度",
        extraDetails: "额外说明",
        dataSources: "数据来源",
        createdByAccountId: "创建者Id",
        updatedByAccountId: "更新者Id",
        createdAt: "创建于",
        updatedAt: "更新于",
        statistics: statistics,
        statisticsId: "统计ID",
        image: image,
        imageId: "图片ID",
        selfName: "怪物",
      },
      crystal: {
        id: "ID",
        modifierList: modifierList,
        name: "锻晶名称",
        crystalType: "锻晶类型",
        front: "前置锻晶数",
        modifierListId: "加成项列表ID",
        extraDetails: "额外说明",
        dataSources: "数据来源",
        createdByAccountId: "创建者Id",
        updatedByAccountId: "更新者Id",
        createdAt: "创建于",
        updatedAt: "更新于",
        statistics: statistics,
        statisticsId: "统计ID",
        selfName: "锻晶",
      },
      skill: {
        id: "ID",
        name: "名称",
        skillType: "类型",
        skillTreeName: "所属技能树",
        weaponElementDependencyType: "属性是否继承武器",
        element: "自身元素属性",
        skillEffect: "技能效果",
        skillDescription: "技能说明",
        extraDetails: "额外说明",
        dataSources: "数据来源",
        createdByAccountId: "创建者Id",
        updatedByAccountId: "更新者Id",
        createdAt: "创建于",
        updatedAt: "更新于",
        statistics: statistics,
        statisticsId: "统计ID",
        selfName: "技能",
      },
      user: {
        id: "账号ID",
        name: "用户名",
        email: "邮件地址",
        emailVerified: "邮件邀请时间",
        image: "头像",
        userRole: "身份类型",
        selfName: "用户",
      },
      skillEffect: {
        id: "ID",
        condition: "生效条件",
        description: "条件说明",
        actionBaseDurationFormula: "固定动作时长表达式（帧）",
        actionModifiableDurationFormula: "可加速动作时长表达式（帧）",
        skillExtraActionType: "额外动作",
        chargingBaseDurationFormula: "固定蓄力时长式表达式（秒）",
        chargingModifiableDurationFormula: "可加速蓄力时长表达式（秒）",
        chantingBaseDurationFormula: "固定咏唱时长表达式（秒）",
        chantingModifiableDurationFormula: "可加速咏唱时长表达式（秒）",
        skillStartupFramesFormula: "技能前摇表达式（秒）",
        belongToskillId: "所属技能",
        skillCost: "消耗项",
        skillYield: "作用项",
        selfName: "技能效果",
      },
      skillCost: {
        id: "ID",
        costFormula: "计算公式",
        skillEffectId: "所属技能效果",
        name: "名称",
        selfName: "技能消耗",
      },
      skillYield: {
        id: "ID",
        name: "名称",
        yieldType: "效果类型",
        mutationTimingFormula: "效果发生变化的时机计算公式",
        yieldFormula: "效果计算公式",
        skillEffectId: "所属技能效果",
        selfName: "技能作用",
      },
      character: {
        id: "Id",
        name: "名称",
        lv: "等级",
        characterType: "角色类型",
        baseStr: "基础力量",
        baseInt: "基础智力",
        baseVit: "基础耐力",
        baseAgi: "基础敏捷",
        baseDex: "基础灵巧",
        specialAbiType: "特殊属性类型",
        specialAbiValue: "特殊属性值",
        mainWeapon: {
          crystalList: "锻晶",
          id: "ID",
          name: "名称",
          mainWeaponType: "主武器类型",
          baseAtk: "基础面板",
          refinement: "精炼值",
          stability: "稳定率",
          element: "元素属性",
          modifierList: modifierList,
          modifierListId: "附魔ID",
          extraDetails: "额外说明",
          dataSources: "数据来源",
          createdByAccountId: "创建者Id",
          updatedByAccountId: "更新者Id",
          createdAt: "创建于",
          updatedAt: "更新于",
          statistics: statistics,
          statisticsId: "统计ID",
          selfName: "主武器",
        },
        mainWeaponId: "主武器Id",
        subWeapon: {
          modifierList: modifierList,
          id: "ID",
          name: "名称",
          subWeaponType: "副武器类型",
          baseAtk: "基础面板",
          refinement: "精炼值",
          stability: "稳定率",
          element: "元素属性",
          modifierListId: "",
          extraDetails: "额外说明",
          dataSources: "数据来源",
          createdByAccountId: "创建者Id",
          updatedByAccountId: "更新者Id",
          createdAt: "创建于",
          updatedAt: "更新于",
          statistics: statistics,
          statisticsId: "统计ID",
          selfName: "副武器",
        },
        subWeaponId: "",
        bodyArmor: {
          modifierList: modifierList,
          crystalList: "锻晶",
          id: "ID",
          name: "名称",
          bodyArmorType: "防具类型",
          refinement: "精炼值",
          baseDef: "基础防御力",
          modifierListId: "",
          extraDetails: "额外说明",
          dataSources: "数据来源",
          createdByAccountId: "创建者Id",
          updatedByAccountId: "更新者Id",
          createdAt: "创建于",
          updatedAt: "更新于",
          statistics: statistics,
          statisticsId: "统计ID",
          selfName: "身体装备",
        },
        bodyArmorId: "",
        additionalEquipment: {
          modifierList: modifierList,
          crystalList: "锻晶",
          id: "ID",
          name: "名称",
          refinement: "精炼值",
          modifierListId: "",
          extraDetails: "额外说明",
          dataSources: "数据来源",
          createdByAccountId: "创建者Id",
          updatedByAccountId: "更新者Id",
          createdAt: "创建于",
          updatedAt: "更新于",
          statistics: statistics,
          statisticsId: "统计ID",
          selfName: "追加装备",
        },
        additionalEquipmentId: "",
        specialEquipment: {
          modifierList: modifierList,
          crystalList: "锻晶",
          id: "ID",
          name: "名称",
          modifierListId: "",
          extraDetails: "额外说明",
          dataSources: "数据来源",
          createdByAccountId: "创建者Id",
          updatedByAccountId: "更新者Id",
          createdAt: "创建于",
          updatedAt: "更新于",
          statistics: statistics,
          statisticsId: "统计ID",
          selfName: "特殊装备",
        },
        specialEquipmentId: "",
        fashion: modifierList,
        fashionModifierListId: "",
        cuisine: modifierList,
        cuisineModifierListId: "",
        consumableList: "消耗品列表",
        skillList: "技能列表",
        combos: "连击列表",
        pet: {
          id: "ID",
          name: "名称",
          extraDetails: "额外说明",
          dataSources: "数据来源",
          createdByAccountId: "创建者Id",
          updatedByAccountId: "更新者Id",
          createdAt: "创建于",
          updatedAt: "更新于",
          statistics: statistics,
          statisticsId: "统计ID",
          selfName: "宠物",
        },
        petId: "宠物Id",
        modifierList: modifierList,
        modifierListId: "额外加成Id",
        extraDetails: "额外说明",
        createdByAccountId: "创建者Id",
        updatedByAccountId: "更新者Id",
        createdAt: "创建于",
        updatedAt: "更新于",
        statistics: statistics,
        statisticsId: "统计ID",
        imageId: "图片ID",
        selfName: "角色",
      },
    },
  },
};

export default dictionary;
