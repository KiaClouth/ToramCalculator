import assert from "node:assert/strict";
import { test } from "vitest";
import { buildSignedDistanceField, ICON_SDF_PADDING, ICON_SDF_RANGE } from "./liquidGlassButton.iconSdf";

/** 从归一化距离场还原带符号的像素距离，便于断言。 */
const decode = (field: Float32Array, index: number): number => (field[index] - 0.5) * ICON_SDF_RANGE * 2;

test("有符号距离场在形状内为正、形状外为负", () => {
	// 16×16 网格中心放一个 8×8 实心方块。
	const size = 16;
	const inside = new Uint8Array(size * size);
	for (let y = 4; y < 12; y += 1) {
		for (let x = 4; x < 12; x += 1) {
			inside[y * size + x] = 1;
		}
	}

	const field = buildSignedDistanceField(inside, size, size);

	// 方块正中心距离最大且为正。
	const center = decode(field, 8 * size + 8);
	assert.ok(center > 0, `中心应为正，实际 ${center}`);

	// 远离方块的角落为负。
	const corner = decode(field, 0);
	assert.ok(corner < 0, `外部角落应为负，实际 ${corner}`);
	assert.ok(corner < -2, `外部角落应远离真实边界，实际 ${corner}`);

	// 中心比靠近边缘的内部像素更远离边界。
	const nearEdge = decode(field, 8 * size + 4);
	assert.ok(center > nearEdge, `中心 ${center} 应大于近边缘 ${nearEdge}`);
});

test("距离场在边界两侧连续变号，使梯度可用作法线", () => {
	const size = 16;
	const inside = new Uint8Array(size * size);
	for (let y = 4; y < 12; y += 1) {
		for (let x = 4; x < 12; x += 1) {
			inside[y * size + x] = 1;
		}
	}

	const field = buildSignedDistanceField(inside, size, size);

	// 沿水平线穿过左边界：x=3 在外、x=4 在内，符号必须相反。
	const outsideEdge = decode(field, 8 * size + 3);
	const insideEdge = decode(field, 8 * size + 4);
	assert.ok(outsideEdge < 0 && insideEdge > 0, `跨边界应变号，实际 ${outsideEdge} → ${insideEdge}`);

	// 这是原实现的缺陷所在：外部像素必须有非零梯度，否则玻璃法线为零向量、
	// 菲涅耳和眩光被乘成 0。相邻外部像素的距离必须不同。
	const outerA = decode(field, 8 * size + 2);
	const outerB = decode(field, 8 * size + 3);
	assert.notStrictEqual(outerA, outerB, "相邻外部像素距离应不同，否则梯度为零");
});

test("空网格不产生 NaN 或哨兵值泄漏", () => {
	const size = 8;
	const field = buildSignedDistanceField(new Uint8Array(size * size), size, size);
	for (let index = 0; index < field.length; index += 1) {
		assert.ok(Number.isFinite(field[index]), `索引 ${index} 应为有限值`);
		assert.ok(field[index] >= 0 && field[index] <= 1, `索引 ${index} 应落在 [0,1]`);
	}
});

test("距离场内边距保留足够的外部采样区域", () => {
	assert.ok(ICON_SDF_PADDING >= 16, `内边距 ${ICON_SDF_PADDING} 应至少覆盖玻璃边缘的外侧距离`);
});
