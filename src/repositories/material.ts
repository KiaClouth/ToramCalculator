import { Expression, ExpressionBuilder, Insertable, Updateable } from "kysely";
import { db } from "./database";
import { DB, item } from "~/repositories/db/types";
import { defaultStatistics } from "./statistics";
import { defaultAccount } from "./account";
import { itemSubRelations } from "./item";

export type Material = Awaited<ReturnType<typeof findMaterialById>>;
export type NewMaterial = Insertable<item>;
export type MaterialUpdate = Updateable<item>;

export function materialSubRelations(eb: ExpressionBuilder<DB, "item">, id: Expression<string>) {
  return [];
}

export async function findMaterialById(id: string) {
  return await db
    .selectFrom("item")
    .innerJoin("material", "item.id", "material.itemId")
    .where("id", "=", id)
    .selectAll(["item", "material"])
    .select((eb) => materialSubRelations(eb, eb.val(id)))
    .select((eb) => itemSubRelations(eb, eb.val(id)))
    .executeTakeFirstOrThrow();
}

export async function updateMaterial(id: string, updateWith: MaterialUpdate) {
  return await db.updateTable("item").set(updateWith).where("item.id", "=", id).returningAll().executeTakeFirst();
}

export async function createMaterial(newMaterial: NewMaterial) {
  return await db.transaction().execute(async (trx) => {
    const item = await trx.insertInto("item").values(newMaterial).returningAll().executeTakeFirstOrThrow();
    return item;
  });
}

export async function deleteMaterial(id: string) {
  return await db.deleteFrom("item").where("item.id", "=", id).returningAll().executeTakeFirst();
}

// default
export const defaultMaterial: Material = {
    name: "默认素材（缺省值）",
    id: "defaultMaterialId",
    itemId: "defaultMaterialId",
    material: "Metal",
    ptValue: 0,
    price: 0,
    dataSources: "",
    extraDetails: "",
    dropBy: [],
    rewardBy: [],
    updatedAt: new Date(),
    createdAt: new Date(),
    updatedByAccountId: defaultAccount.id,
    createdByAccountId: defaultAccount.id,
    statistics: defaultStatistics,
    statisticsId: defaultStatistics.id,
};
