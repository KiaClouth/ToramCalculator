export enum ModifierType {
    DEFAULT = "DEFAULT",
    // 能力值
    STR = "STR", // 力量
    INT = "INT", // 智力
    VIT = "VIT", // 耐力
    AGI = "AGI", // 敏捷
    DEX = "DEX", // 灵巧
    // 基础属性
    MAX_MP = "MAX_MP", // 最大MP
    AGGRO = "AGGRO", // 仇恨值
    WEAPON_RANGE = "WEAPON_RANGE", // 武器射程
    HP_REGEN = "HP_REGEN", // HP自然回复
    MP_REGEN = "MP_REGEN", // MP自然回复
    // 单次伤害增幅
    PHYSICAL_ATK = "PHYSICAL_ATK", // 物理攻击
    MAGICAL_ATK = "MAGICAL_ATK", // 魔法攻击
    WEAPON_ATK = "WEAPON_ATK", // 武器攻击
    UNSHEATHE_ATK = "UNSHEATHE_ATK", // 拔刀攻击
    PHYSICAL_PIERCE = "PHYSICAL_PIERCE", // 物理贯穿
    MAGICAL_PIERCE = "MAGICAL_PIERCE", // 魔法贯穿
    CRITICAL_RATE = "CRITICAL_RATE", // 暴击率
    CRITICAL_DAMAGE = "CRITICAL_DAMAGE", // 暴击伤害
    MAGIC_CRT_CONVERSION_RATE = "MAGIC_CRT_CONVERSION_RATE", // 魔法暴击转化率
    MAGIC_CRT_DAMAGE_CONVERSION_RATE = "MAGIC_CRT_DAMAGE_CONVERSION_RATE", // 魔法爆伤转化率
    SHORT_RANGE_DAMAGE = "SHORT_RANGE_DAMAGE", // 近距离威力
    LONG_RANGE_DAMAGE = "LONG_RANGE_DAMAGE", // 远距离威力
    STRONGER_AGAINST_NETURAL = "STRONGER_AGAINST_NETURAL", // 对无属性增强
    STRONGER_AGAINST_LIGHT = "STRONGER_AGAINST_LIGHT", // 对光属性增强
    STRONGER_AGAINST_DARK = "STRONGER_AGAINST_DARK", // 对暗属性增强
    STRONGER_AGAINST_WATER = "STRONGER_AGAINST_WATER", // 对水属性增强
    STRONGER_AGAINST_FIRE = "STRONGER_AGAINST_FIRE", // 对火属性增强
    STRONGER_AGAINST_EARTH = "STRONGER_AGAINST_EARTH", // 对地属性增强
    STRONGER_AGAINST_WIND = "STRONGER_AGAINST_WIND", // 对风属性增强
    STABILITY = "STABILITY", // 稳定率
    ACCURACY = "ACCURACY", // 命中
    ADDITIONAL_PHYSICS = "ADDITIONAL_PHYSICS", // 物理追击
    ADDITIONAL_MAGIC = "ADDITIONAL_MAGIC", // 魔法追击
    ANTICIPATE = "ANTICIPATE", // 看穿
    GUARD_BREAK = "GUARD_BREAK", // 破防
    REFLECT = "REFLECT", // 反弹伤害
    ABSOLUTA_ACCURACY = "ABSOLUTA_ACCURACY", // 绝对命中
    ATK_UP_STR = "ATK_UP_STR", // 物理攻击提升（力量）
    ATK_UP_INT = "ATK_UP_INT", // 物理攻击提升（智力）
    ATK_UP_VIT = "ATK_UP_VIT", // 物理攻击提升（耐力）
    ATK_UP_AGI = "ATK_UP_AGI", // 物理攻击提升（敏捷）
    ATK_UP_DEX = "ATK_UP_DEX", // 物理攻击提升（灵巧）
    MATK_UP_STR = "MATK_UP_STR", // 魔法攻击提升（力量）
    MATK_UP_INT = "MATK_UP_INT", // 魔法攻击提升（智力）
    MATK_UP_VIT = "MATK_UP_VIT", // 魔法攻击提升（耐力）
    MATK_UP_AGI = "MATK_UP_AGI", // 魔法攻击提升（敏捷）
    MATK_UP_DEX = "MATK_UP_DEX", // 魔法攻击提升（灵巧）
    ATK_DOWN_STR = "ATK_DOWN_STR", // 物理攻击下降（力量）
    ATK_DOWN_INT = "ATK_DOWN_INT", // 物理攻击下降（智力）
    ATK_DOWN_VIT = "ATK_DOWN_VIT", // 物理攻击下降（耐力）
    ATK_DOWN_AGI = "ATK_DOWN_AGI", // 物理攻击下降（敏捷）
    ATK_DOWN_DEX = "ATK_DOWN_DEX", // 物理攻击下降（灵巧）
    MATK_DOWN_STR = "MATK_DOWN_STR", // 魔法攻击下降（力量）
    MATK_DOWN_INT = "MATK_DOWN_INT", // 魔法攻击下降（智力）
    MATK_DOWN_VIT = "MATK_DOWN_VIT", // 魔法攻击下降（耐力）
    MATK_DOWN_AGI = "MATK_DOWN_AGI", // 魔法攻击下降（敏捷）
    MATK_DOWN_DEX = "MATK_DOWN_DEX", // 魔法攻击下降（灵巧）
    // 生存能力加成
    MAX_HP = "MAX_HP", // 最大HP
    PHYSICAL_DEF = "PHYSICAL_DEF", // 物理防御
    MAGICAL_DEF = "MAGICAL_DEF", // 魔法防御
    PHYSICAL_RESISTANCE = "PHYSICAL_RESISTANCE", // 物理抗性
    MAGICAL_RESISTANCE = "MAGICAL_RESISTANCE", // 魔法抗性
    NEUTRAL_RESISTANCE = "NEUTRAL_RESISTANCE", // 无属性抗性
    LIGHT_RESISTANCE = "LIGHT_RESISTANCE", // 光属性抗性
    DARK_RESISTANCE = "DARK_RESISTANCE", // 暗属性抗性
    WATER_RESISTANCE = "WATER_RESISTANCE", // 水属性抗性
    FIRE_RESISTANCE = "FIRE_RESISTANCE", // 火属性抗性
    EARTH_RESISTANCE = "EARTH_RESISTANCE", // 地属性抗性
    WIND_RESISTANCE = "WIND_RESISTANCE", // 风属性抗性
    DODGE = "DODGE", // 回避
    AILMENT_RESISTANCE = "AILMENT_RESISTANCE", // 异常抗性
    BASE_GUARD_POWER = "BASE_GUARD_POWER", // 基础格挡力
    GUARD_POWER = "GUARD_POWER", // 格挡力
    BASE_GUARD_RECHARGE = "BASE_GUARD_RECHARGE", // 基础格挡回复
    GUARD_RECHANGE = "GUARD_RECHANGE", // 格挡回复
    EVASION_RECHARGE = "EVADE_RECHARGE", // 闪躲回复
    PHYSICAL_BARRIER = "PHYSICAL_BARRIER", // 物理屏障
    MAGICAL_BARRIER = "MAGICAL_BARRIER", // 魔法屏障
    FRACTIONAL_BARRIER = "FRACTIONAL_BARRIER", // 百分比瓶屏障
    BARRIER_COOLDOWN = "BARRIER_COOLDOWN", // 屏障回复速度
    REDUCE_DMG_FLOOR = "REDUCE_DMG_FLOOR", // 地面伤害减轻（地刺）
    REDUCE_DMG_METEOR = "REDUCE_DMG_METEOR", // 陨石伤害减轻（天火）
    REDUCE_DMG_PLAYER_EPICENTER = "REDUCE_DMG_PLAYER_EPICENTER", // 范围伤害减轻（以玩家为中心的范围伤害）
    REDUCE_DMG_FOE_EPICENTER = "REDUCE_DMG_FOE_EPICENTER", // 敌方周围伤害减轻（以怪物自身为中心的范围伤害）
    REDUCE_DMG_BOWLING = "REDUCE_DMG_BOWLING", // 贴地伤害减轻（剑气、风刃）
    REDUCE_DMG_BULLET = "REDUCE_DMG_BULLET", // 子弹伤害减轻（各种球）
    REDUCE_DMG_STRAIGHT_LINE = "REDUCE_DMG_STRAIGHT_LINE", // 直线伤害减轻（激光）
    REDUCE_DMG_CHARGE = "REDUCE_DMG_CHARGE", // 冲撞伤害减轻（怪物的位移技能）
    ABSOLUTE_DODGE = "ABSOLUTE_DODGE", // 绝对回避
    // 速度加成
    ASPD = "ASPD", // 攻击速度
    CSPD = "CSPD", // 咏唱速度
    MSPD = "MSPD", // 行动速度
    // 其他加成 
    DROP_RATE = "DROP_RATE", // 掉宝率
    REVIVE_TIME = "REVIVE_TIME", // 复活时间
    FLINCH_UNAVAILABLE = "FLINCH_UNAVAILABLE", // 封印胆怯
    TUMBLE_UNAVAILABLE = "TUMBLE_UNAVAILABLE", // 封印翻覆
    STUN_UNAVAILABLE = "STUN_UNAVAILABLE", // 封印昏厥
    INVINCIBLE_AID = "INVINCIBLE_AID", // 无敌急救
    EXP_RATE = "EXP_RATE", // 经验加成
    PET_EXP = "PET_EXP", // 宠物经验
    ITEM_COOLDOWN = "ITEM_COOLDOWN", // 道具冷却
    RECOIL_DAMAGE = "RECOIL_DAMAGE", // 反作用伤害
    GEM_POWDER_DROP = "GEM_POWDER_DROP", // 晶石粉末掉落
}