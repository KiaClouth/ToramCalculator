import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type account = {
    id: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    userId: string;
};
export type account_create_data = {
    accountId: string;
};
export type account_update_data = {
    accountId: string;
};
export type activity = {
    id: string;
    name: unknown;
};
export type additional_equipment = {
    name: unknown;
    baseDef: number;
    modifiers: string[];
    colorA: number;
    colorB: number;
    colorC: number;
    itemId: string;
};
export type additional_equipmentTocrystal = {
    A: string;
    B: string;
};
export type additional_equipmentToimage = {
    A: string;
    B: string;
};
export type address = {
    id: string;
    name: unknown;
    type: string;
    x: number;
    y: number;
    worldId: string;
};
export type armor = {
    name: unknown;
    baseDef: number;
    modifiers: string[];
    colorA: number;
    colorB: number;
    colorC: number;
    itemId: string;
};
export type armor_enchantment_attributes = {
    id: string;
    name: string;
    flow: unknown;
    details: string | null;
    dataSources: string | null;
    statisticId: string;
    updatedByAccountId: string | null;
    createdByAccountId: string | null;
};
export type armorTocrystal = {
    A: string;
    B: string;
};
export type armorToimage = {
    A: string;
    B: string;
};
export type avatar = {
    id: string;
    name: string;
    type: string;
    modifiers: string[];
    playerId: string;
};
export type avatarTocharacter = {
    A: string;
    B: string;
};
export type BackRelation = {
    A: string;
    B: string;
};
export type character = {
    id: string;
    name: string;
    lv: number;
    str: number;
    int: number;
    vit: number;
    agi: number;
    dex: number;
    personalityType: string;
    personalityValue: number;
    weaponId: string;
    subWeaponId: string;
    armorId: string;
    addEquipId: string;
    speEquipId: string;
    cooking: string[];
    modifiers: string[];
    partnerSkillA: string;
    partnerSkillAType: string;
    partnerSkillB: string;
    partnerSkillBType: string;
    masterId: string;
    details: string;
    statisticId: string;
    imageId: string;
};
export type character_skill = {
    id: string;
    lv: number;
    templateId: string;
};
export type characterTocharacter_skill = {
    A: string;
    B: string;
};
export type characterTocombo = {
    A: string;
    B: string;
};
export type characterToconsumable = {
    A: string;
    B: string;
};
export type combo = {
    id: string;
    name: string;
    combo: unknown;
};
export type consumable = {
    name: unknown;
    itemId: string;
    type: string;
    effectDuration: number;
    effects: string[];
};
export type crystal = {
    name: unknown;
    crystalType: string;
    modifiers: string[];
    itemId: string;
};
export type crystalTocustom_additional_equipment = {
    A: string;
    B: string;
};
export type crystalTocustom_armor = {
    A: string;
    B: string;
};
export type crystalTocustom_special_equipment = {
    A: string;
    B: string;
};
export type crystalTocustom_weapon = {
    A: string;
    B: string;
};
export type crystalTospecial_equipment = {
    A: string;
    B: string;
};
export type crystalToweapon = {
    A: string;
    B: string;
};
export type custom_additional_equipment = {
    id: string;
    name: string;
    def: number;
    templateId: string;
    refinement: number;
    masterId: string;
};
export type custom_armor = {
    id: string;
    name: string;
    def: number;
    armorType: string;
    templateId: string;
    refinement: number;
    enchantmentAttributesId: string | null;
    masterId: string;
};
export type custom_pet = {
    id: string;
    templateId: string;
    pStr: number;
    pInt: number;
    pVit: number;
    pAgi: number;
    pDex: number;
    str: number;
    int: number;
    vit: number;
    agi: number;
    dex: number;
    weaponType: string;
    persona: string;
    type: string;
    weaponAtk: number;
    masterId: string;
};
export type custom_special_equipment = {
    id: string;
    name: string;
    def: number;
    templateId: string;
    refinement: number;
    masterId: string;
};
export type custom_weapon = {
    id: string;
    name: string;
    extraAbi: number;
    templateId: string;
    refinement: number;
    enchantmentAttributesId: string | null;
    masterId: string;
};
export type drop_item = {
    id: string;
    itemId: string;
    probability: number;
    relatedPart: string;
    relatedPartInfo: string;
    breakReward: string;
    dropById: string;
};
export type FrontRelation = {
    A: string;
    B: string;
};
export type image = {
    id: string;
    dataUrl: string;
};
export type imageToweapon = {
    A: string;
    B: string;
};
export type item = {
    id: string;
    name: unknown;
    dataSources: string;
    details: string;
    statisticId: string;
    updatedByAccountId: string | null;
    createdByAccountId: string | null;
};
export type kill_requirement = {
    id: string;
    mobId: string;
    count: number;
    taskId: string;
};
export type material = {
    name: unknown;
    itemId: string;
    material: string;
    ptValue: number;
    price: number;
};
export type member = {
    id: string;
    playerId: string | null;
    partnerId: string | null;
    mercenaryId: string | null;
    mobId: string | null;
    mobDifficultyFlag: string;
};
export type memberToteam = {
    A: string;
    B: string;
};
export type mercenary = {
    type: string;
    templateId: string;
    skillAId: string;
    skillAType: string;
    skillBId: string;
    skillBType: string;
};
export type mob = {
    id: string;
    name: unknown;
    mobType: string;
    captureable: boolean;
    baseLv: number;
    experience: number;
    partsExperience: number;
    element: string;
    radius: number;
    maxhp: number;
    physicalDefense: number;
    physicalResistance: number;
    magicalDefense: number;
    magicalResistance: number;
    criticalResistance: number;
    avoidance: number;
    dodge: number;
    block: number;
    normalAttackResistanceModifier: number;
    physicalAttackResistanceModifier: number;
    magicalAttackResistanceModifier: number;
    actions: unknown;
    details: string;
    dataSources: string;
    statisticId: string;
    imageId: string;
    updatedByAccountId: string | null;
    createdByAccountId: string | null;
};
export type mobTozone = {
    A: string;
    B: string;
};
export type npc = {
    id: string;
    name: unknown;
    imageId: string;
    zoneId: string;
};
export type player = {
    id: string;
    name: string;
    useIn: string;
    actions: unknown;
    accountId: string;
};
export type post = {
    id: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdById: string;
};
export type recipe = {
    id: string;
    weaponId: string | null;
    armorId: string | null;
    addEquipId: string | null;
    speEquipId: string | null;
    consumableId: string | null;
    activityId: string | null;
};
export type recipe_ingredient = {
    id: string;
    type: string;
    count: number;
    itemId: string | null;
    recipeId: string;
};
export type reward = {
    id: string;
    type: string;
    value: number;
    probability: number;
    itemId: string | null;
    taskId: string;
};
export type session = {
    id: string;
    sessionToken: string;
    expires: Timestamp;
    accountId: string;
};
export type simulator = {
    id: string;
    name: string;
    visibility: string;
    details: string | null;
    statisticId: string;
    updatedByAccountId: string | null;
    createdByAccountId: string | null;
};
export type simulatorToteam = {
    A: string;
    B: string;
};
export type skill = {
    id: string;
    treeName: unknown;
    posX: number;
    posY: number;
    tier: number;
    name: unknown;
    isPassive: boolean;
    element: string;
    chargingType: string;
    distanceResist: string;
    details: string;
    dataSources: string;
    statisticId: string;
    updatedByAccountId: string | null;
    createdByAccountId: string | null;
};
export type skill_effect = {
    id: string;
    mainHand: string;
    subHand: string;
    armor: string;
    description: unknown;
    motionFixed: string;
    motionModified: string;
    chantingFixed: string;
    chantingModified: string;
    reservoirFixed: string;
    reservoirModified: string;
    startupFrames: string;
    cost: string;
    details: unknown;
    belongToskillId: string;
};
export type special_equipment = {
    name: unknown;
    baseDef: number;
    modifiers: string[];
    itemId: string;
};
export type statistic = {
    id: string;
    updatedAt: Timestamp;
    createdAt: Timestamp;
    usageTimestamps: Timestamp[];
    viewTimestamps: Timestamp[];
};
export type task = {
    id: string;
    lv: number;
    name: unknown;
    type: string;
    description: unknown;
    npcId: string;
};
export type task_require = {
    id: string;
    type: string;
    count: number;
    itemId: string | null;
    taskId: string;
};
export type team = {
    id: string;
    name: string | null;
    gems: string[];
};
export type user = {
    id: string;
    /**
     * @zod.string.min(2, { message: "最少2个字符" })
     */
    name: string | null;
    email: string | null;
    emailVerified: Timestamp | null;
    image: string | null;
    userRole: string;
};
export type verification_token = {
    identifier: string;
    token: string;
    expires: Timestamp;
};
export type weapon = {
    name: unknown;
    type: string;
    baseAbi: number;
    stability: number;
    modifiers: string[];
    colorA: number;
    colorB: number;
    colorC: number;
    itemId: string;
};
export type weapon_enchantment_attributes = {
    id: string;
    name: string;
    flow: unknown;
    details: string | null;
    dataSources: string | null;
    statisticId: string;
    updatedByAccountId: string | null;
    createdByAccountId: string | null;
};
export type world = {
    id: string;
    name: unknown;
};
export type zone = {
    id: string;
    name: unknown | null;
    linkZone: string[];
    rewardNodes: number;
    activityId: string | null;
    addressId: string;
};
export type DB = {
    _additional_equipmentTocrystal: additional_equipmentTocrystal;
    _additional_equipmentToimage: additional_equipmentToimage;
    _armorTocrystal: armorTocrystal;
    _armorToimage: armorToimage;
    _avatarTocharacter: avatarTocharacter;
    _BackRelation: BackRelation;
    _characterTocharacter_skill: characterTocharacter_skill;
    _characterTocombo: characterTocombo;
    _characterToconsumable: characterToconsumable;
    _crystalTocustom_additional_equipment: crystalTocustom_additional_equipment;
    _crystalTocustom_armor: crystalTocustom_armor;
    _crystalTocustom_special_equipment: crystalTocustom_special_equipment;
    _crystalTocustom_weapon: crystalTocustom_weapon;
    _crystalTospecial_equipment: crystalTospecial_equipment;
    _crystalToweapon: crystalToweapon;
    _FrontRelation: FrontRelation;
    _imageToweapon: imageToweapon;
    _memberToteam: memberToteam;
    _mobTozone: mobTozone;
    _simulatorToteam: simulatorToteam;
    account: account;
    account_create_data: account_create_data;
    account_update_data: account_update_data;
    activity: activity;
    additional_equipment: additional_equipment;
    address: address;
    armor: armor;
    armor_enchantment_attributes: armor_enchantment_attributes;
    avatar: avatar;
    character: character;
    character_skill: character_skill;
    combo: combo;
    consumable: consumable;
    crystal: crystal;
    custom_additional_equipment: custom_additional_equipment;
    custom_armor: custom_armor;
    custom_pet: custom_pet;
    custom_special_equipment: custom_special_equipment;
    custom_weapon: custom_weapon;
    drop_item: drop_item;
    image: image;
    item: item;
    kill_requirement: kill_requirement;
    material: material;
    member: member;
    mercenary: mercenary;
    mob: mob;
    npc: npc;
    player: player;
    post: post;
    recipe: recipe;
    recipe_ingredient: recipe_ingredient;
    reward: reward;
    session: session;
    simulator: simulator;
    skill: skill;
    skill_effect: skill_effect;
    special_equipment: special_equipment;
    statistic: statistic;
    task: task;
    task_require: task_require;
    team: team;
    user: user;
    verification_token: verification_token;
    weapon: weapon;
    weapon_enchantment_attributes: weapon_enchantment_attributes;
    world: world;
    zone: zone;
};
