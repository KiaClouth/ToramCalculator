import { Expression, ExpressionBuilder, Insertable, Updateable } from "kysely";
import { db } from "./database";
import { DB, body_armor } from "~/repositories/db/types";
import { statisticsSubRelations, createStatistics, defaultStatistics } from "./statistics";
import { createModifierList, defaultModifierList, modifierListSubRelations } from "./modifier_list";
import { crystalSubRelations, defaultCrystal, NewCrystal } from "./crystal";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export type BodyArmor = Awaited<ReturnType<typeof findBodyArmorById>>;
export type NewBodyArmor = Insertable<body_armor>;
export type BodyArmorUpdate = Updateable<body_armor>;

export function bodyArmorSubRelations(eb: ExpressionBuilder<DB, "body_armor">, id: Expression<string>) {
  return [
    jsonArrayFrom(
      eb
        .selectFrom("_body_armorTocrystal")
        .innerJoin("crystal", "_body_armorTocrystal.B", "crystal.id")
        .whereRef("_body_armorTocrystal.A", "=", "body_armor.id")
        .selectAll("crystal")
        .select((subEb) => crystalSubRelations(subEb, subEb.val(id))),
    ).as("crystalList"),
    jsonObjectFrom(
      eb
        .selectFrom("statistics")
        .whereRef("id", "=", "body_armor.statisticsId")
        .selectAll("statistics")
        .select((subEb) => statisticsSubRelations(subEb, subEb.val(id))),
    ).as("statistics"),
    jsonObjectFrom(
      eb
        .selectFrom("modifier_list")
        .whereRef("id", "=", "body_armor.modifierListId")
        .selectAll("modifier_list")
        .select((subEb) => modifierListSubRelations(subEb, subEb.val(id))),
    ).as("modifierList"),
  ];
}

export async function findBodyArmorById(id: string) {
  return await db
    .selectFrom("body_armor")
    .where("id", "=", id)
    .selectAll("body_armor")
    .select((eb) => bodyArmorSubRelations(eb, eb.val(id)))
    .executeTakeFirstOrThrow();
}

export async function updateBodyArmor(id: string, updateWith: BodyArmorUpdate) {
  return await db.updateTable("body_armor").set(updateWith).where("id", "=", id).returningAll().executeTakeFirst();
}

export async function createBodyArmor(newBodyArmor: NewBodyArmor) {
  return await db.transaction().execute(async (trx) => {
    const body_armor = await trx.insertInto("body_armor").values(newBodyArmor).returningAll().executeTakeFirstOrThrow();
    const modifierList = await createModifierList(defaultModifierList);
    const statistics = await createStatistics(defaultStatistics);
    const crystalList: NewCrystal[] = [];
    return { ...body_armor, modifierList, crystalList, statistics };
  });
}

export async function deleteBodyArmor(id: string) {
  return await db.deleteFrom("body_armor").where("id", "=", id).returningAll().executeTakeFirst();
}

// default
export const defaultBodyArmor: BodyArmor = {
  id: "defaultBodyArmorId",
  name: "defaultBodyArmorName",
  refinement: 0,
  bodyArmorType: "NORMAL",
  baseDef: 0,
  dataSources: "",
  extraDetails: "",

  updatedAt: new Date(),
  updatedByUserId: "",
  createdAt: new Date(),
  createdByUserId: "",
  crystalList: [defaultCrystal],
  modifierList: defaultModifierList,
  modifierListId: defaultModifierList.id,

  statistics: defaultStatistics,
  statisticsId: defaultStatistics.id,
};
