import { createEffect, createMemo, createResource, createSignal, For, JSX, onCleanup, onMount, Show } from "solid-js";
import Fuse from "fuse.js";
import {
  Column,
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/solid-table";
import { createVirtualizer, Virtualizer } from "@tanstack/solid-virtual";
import { Motion, Presence } from "solid-motionone";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import type { OverlayScrollbarsComponentRef } from "overlayscrollbars-solid";
import * as _ from "lodash-es";

import { defaultImage } from "~/repositories/image";
import { type Mob, MobDic, defaultMob, findMobs } from "~/repositories/mob";
import { FormSate, setStore, store } from "~/store";
import { getDictionary } from "~/locales/i18n";
import { generateAugmentedMobList } from "~/lib/untils/mob";
import * as Icon from "~/lib/icon";
import Dialog from "~/components/ui/dialog";
import Button from "~/components/ui/button";
import * as Enums from "~/repositories/enums";

export default function MobIndexPage() {
  // 状态管理参数
  const [isFormFullscreen, setIsFormFullscreen] = createSignal(true);
  const [dialogState, setDialogState] = createSignal(false);
  const [formState, setFormState] = createSignal<FormSate>("CREATE");
  const [activeBannerIndex, setActiveBannerIndex] = createSignal(1);
  const setMobFormState = (newState: FormSate): void => {
    setStore("mobPage", {
      mobFormState: newState,
    });
  };
  const setAugmented = (newAugmented: boolean): void => {
    setStore("mobPage", {
      augmented: newAugmented,
    });
  };
  const setMobList = (newList: Mob[]): void => {
    setStore("mobPage", {
      mobList: newList,
    });
  };
  const setFilterState = (newState: boolean): void => {
    setStore("mobPage", {
      filterState: newState,
    });
  };
  const setMob = (newMob: Mob): void => {
    setStore("mobPage", "mobId", newMob.id);
  };

  const [dictionary, setDictionary] = createSignal(getDictionary("en"));

  createEffect(() => {
    setDictionary(getDictionary(store.settings.language));
  });

  // table原始数据------------------------------------------------------------

  const [mobList, { refetch: refetchMobList }] = createResource(findMobs);
  // table
  const columns: ColumnDef<Mob>[] = [
    {
      accessorKey: "id",
      header: () => MobDic(store.settings.language).id,
      cell: (info) => info.getValue(),
      size: 200,
    },
    {
      accessorKey: "name",
      header: () => MobDic(store.settings.language).name,
      cell: (info) => info.getValue(),
      size: 220,
    },
    {
      accessorKey: "mobType",
      header: () => MobDic(store.settings.language).mobType,
      cell: (info) => dictionary().enums.MobType[info.getValue<Enums.MobType>()],
      size: 120,
    },
    {
      accessorKey: "captureable",
      header: () => MobDic(store.settings.language).captureable,
      cell: (info) => info.getValue(),
      size: 120,
    },
    {
      accessorKey: "baseLv",
      header: () => MobDic(store.settings.language).baseLv,
      cell: (info) => info.getValue(),
      size: 120,
    },
    {
      accessorKey: "experience",
      header: () => MobDic(store.settings.language).experience,
      size: 120,
    },
    {
      accessorKey: "partsExperience",
      header: () => MobDic(store.settings.language).partsExperience,
      cell: (info) => info.getValue(),
      size: 120,
    },
    {
      accessorKey: "element",
      header: () => MobDic(store.settings.language).element,
      cell: (info) => dictionary().enums.Element[info.getValue<Enums.ElementType>()],
      size: 120,
    },
    {
      accessorKey: "physicalDefense",
      header: () => MobDic(store.settings.language).physicalDefense,
      size: 120,
    },
    {
      accessorKey: "physicalResistance",
      header: () => MobDic(store.settings.language).physicalResistance,
      size: 120,
    },
    {
      accessorKey: "magicalDefense",
      header: () => MobDic(store.settings.language).magicalDefense,
      size: 120,
    },
    {
      accessorKey: "magicalResistance",
      header: () => MobDic(store.settings.language).magicalResistance,
      size: 120,
    },
    {
      accessorKey: "criticalResistance",
      header: () => MobDic(store.settings.language).criticalResistance,
      size: 120,
    },
    {
      accessorKey: "avoidance",
      header: () => MobDic(store.settings.language).avoidance,
      size: 100,
    },
    {
      accessorKey: "dodge",
      header: () => MobDic(store.settings.language).dodge,
      size: 100,
    },
    {
      accessorKey: "block",
      header: () => MobDic(store.settings.language).block,
      size: 100,
    },
    {
      accessorKey: "actions",
      header: () => MobDic(store.settings.language).actions,
      cell: (info) => info.getValue(),
      size: 150,
    },
    {
      accessorKey: "belongToZones",
      header: () => MobDic(store.settings.language).belongToZones,
      cell: (info) => info.getValue(),
      size: 150,
    },
  ];
  const table = createMemo(() => {
    if (!mobList()) {
      return undefined;
    }
    return createSolidTable({
      get data() {
        return mobList() ?? []; // 使用 getter 确保表格能动态响应数据的变化
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      debugTable: true,
      initialState: {
        sorting: [
          {
            id: "experience",
            desc: true, // 默认按热度降序排列
          },
        ],
      },
    });
  });
  const mobTableHiddenData: Array<keyof Mob> = ["id", "mobType", "updatedByAccountId"];
  // 表头固定
  const getCommonPinningStyles = (column: Column<Mob>): JSX.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");
    const styles: JSX.CSSProperties = {
      position: isPinned ? "sticky" : "relative",
      width: column.getSize().toString(),
      "z-index": isPinned ? 1 : 0,
    };
    if (isPinned) {
      styles.left = isLastLeft ? `${column.getStart("left")}px` : undefined;
      styles.right = isFirstRight ? `${column.getAfter("right")}px` : undefined;
      styles["border-width"] = isLastLeft ? "0px 2px 0px 0px" : isFirstRight ? "0px 0px 0px 2px" : undefined;
    }
    return styles;
  };

  // 列表虚拟化区域----------------------------------------------------------
  const [virtualScrollElement, setVirtualScrollElement] = createSignal<OverlayScrollbarsComponentRef | undefined>(
    undefined,
  );

  const [virtualizer, setVirtualizer] = createSignal<Virtualizer<HTMLElement, Element> | undefined>(undefined);

  // 搜索使用的基准列表--------------------------------------------------------
  let actualList = generateAugmentedMobList(mobList() ?? [], dictionary());

  // 搜索框行为函数
  // 定义搜索时需要忽略的数据
  const mobSearchHiddenData: Array<keyof Mob> = [
    "id",
    "experience",
    "radius",
    "difficultyOfMelee",
    "difficultyOfRanged",
    "difficultyOfTank",
    "updatedByAccountId",
    "createdByAccountId",
  ];

  // 搜索
  const searchMob = (value: string, list: Mob[]) => {
    const fuse = new Fuse(list, {
      keys: Object.keys(defaultMob).filter((key) => !mobSearchHiddenData.includes(key as keyof Mob)),
    });
    return fuse.search(value).map((result) => result.item);
  };

  const handleSearchChange = (key: string) => {
    if (key === "" || key === null) {
      console.log(actualList);
    } else {
      console.log(searchMob(key, actualList));
    }
  };

  const handleMouseDown = (id: string, e: MouseEvent) => {
    if (e.button !== 0) return;
    const startX = e.pageX;
    const startY = e.pageY;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      offsetX = e.pageX - startX;
      offsetY = e.pageY - startY;
      if (!isDragging) {
        // 判断是否开始拖动
        isDragging = Math.abs(offsetX) > 3 || Math.abs(offsetY) > 3;
      }
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        const parent = virtualScrollElement()?.osInstance()?.elements().viewport?.parentElement;
        if (parent) {
          parent.style.transition = "none";
          parent.style.transition = "none";
          // parent.scrollTop -= offsetY / 100;
          parent.scrollLeft += offsetX / 100;
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (!isDragging) {
        console.log(id);
        const targetMob = (mobList() ?? []).find((mob) => mob.id === id);
        if (targetMob) {
          setMob(targetMob);
          setDialogState(true);
          setMobFormState("DISPLAY");
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleUKeyPress = (e: KeyboardEvent) => {
    if (e.key === "u") {
      setStore("mobPage", {
        mobDialogState: true,
        mobFormState: "CREATE",
      });
    }
  };

  createEffect(() => {
    setVirtualizer(
      createVirtualizer({
        get count() {
          return table()?.getRowCount() ?? 0;
        },
        getScrollElement: () => {
          return virtualScrollElement()?.osInstance()?.elements().viewport ?? null;
        },
        estimateSize: () => 96,
        overscan: 5,
      }),
    );
  });

  // u键监听
  onMount(() => {
    console.log("--Mob Client Render");
    // u键监听
    document.addEventListener("keydown", handleUKeyPress);
  });

  onCleanup(() => {
    console.log("--Mob Client Unmount");
    document.removeEventListener("keydown", handleUKeyPress);
  });

  return (
    <main class="flex h-[calc(100dvh-67px)] w-full flex-col overflow-hidden lg:h-dvh">
      <Presence exitBeforeEnter>
        <Show when={!isFormFullscreen()}>
          <Motion.div
            class="Title hidden flex-col p-3 lg:flex lg:pt-12"
            animate={{ opacity: [0, 1] }}
            exit={{ opacity: 0 }}
          >
            <div class="Content flex flex-row items-center justify-between gap-4 py-3">
              <h1 class="Text lg: text-left text-[2.5rem] leading-[50px] lg:bg-transparent lg:leading-[48px]">
                {dictionary().ui.mob.pageTitle}
              </h1>
              <input
                id="MobSearchBox"
                type="search"
                placeholder={dictionary().ui.searchPlaceholder}
                class="h-[50px] w-full flex-1 rounded-none border-b-2 border-dividing-color bg-transparent px-3 py-2 backdrop-blur-xl placeholder:text-dividing-color hover:border-mainText-color focus:border-mainText-color focus:outline-none lg:h-[48px] lg:flex-1 lg:px-5 lg:font-normal"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Button // 仅移动端显示
                size="sm"
                icon={<Icon.Line.CloudUpload />}
                class="flex lg:hidden"
                onClick={() => {
                  setMob(defaultMob);
                  setStore("mobPage", {
                    mobDialogState: true,
                    mobFormState: "CREATE",
                  });
                }}
              ></Button>
              <Button // 仅PC端显示
                icon={<Icon.Line.CloudUpload />}
                class="hidden lg:flex"
                onClick={() => {
                  setMob(defaultMob);
                  setStore("mobPage", {
                    mobDialogState: true,
                    mobFormState: "CREATE",
                  });
                }}
              >
                {dictionary().ui.actions.upload} [u]
              </Button>
            </div>
          </Motion.div>
        </Show>
      </Presence>
      <Presence exitBeforeEnter>
        <Show when={!isFormFullscreen()}>
          <Motion.div
            class="Banner hidden h-[260px] flex-initial gap-3 p-3 opacity-0 lg:flex"
            animate={{ opacity: [0, 1] }}
            exit={{ opacity: 0 }}
          >
            <div class="BannerContent flex flex-1 gap-6 lg:gap-2">
              <div
                class={`banner1 flex-none overflow-hidden rounded ${activeBannerIndex() === 1 ? "active shadow-lg shadow-dividing-color" : ""}`}
                onMouseEnter={() => setActiveBannerIndex(1)}
                style={{
                  "background-image": `url(${mobList()?.[0]?.image.dataUrl !== `"data:image/png;base64,"` ? mobList()?.[0]?.image.dataUrl : defaultImage.dataUrl})`,
                  "background-position": "center center",
                }}
              >
                <div class="mask hidden h-full flex-col justify-center gap-2 bg-brand-color-1st p-8 text-primary-color lg:flex">
                  <span class="text-3xl font-bold">Top.1</span>
                  <div class="h-[1px] w-[110px] bg-primary-color"></div>
                  <span class="text-xl">{mobList()?.[0]?.name}</span>
                </div>
              </div>
              <div
                class={`banner2 flex-none overflow-hidden rounded ${activeBannerIndex() === 2 ? "active shadow-lg shadow-dividing-color" : ""}`}
                onMouseEnter={() => setActiveBannerIndex(2)}
                style={{
                  "background-image": `url(${mobList()?.[1]?.image.dataUrl !== `"data:image/png;base64,"` ? mobList()?.[0]?.image.dataUrl : defaultImage.dataUrl})`,
                  "background-position": "center center",
                }}
              >
                <div class="mask hidden h-full flex-col justify-center gap-2 bg-brand-color-2nd p-8 text-primary-color lg:flex">
                  <span class="text-3xl font-bold">Top.2</span>
                  <div class="h-[1px] w-[110px] bg-primary-color"></div>
                  <span class="text-xl">{mobList()?.[1]?.name}</span>
                </div>
              </div>
              <div
                class={`banner2 flex-none overflow-hidden rounded ${activeBannerIndex() === 3 ? "active shadow-lg shadow-dividing-color" : ""}`}
                onMouseEnter={() => setActiveBannerIndex(3)}
                style={{
                  "background-image": `url(${mobList()?.[2]?.image.dataUrl !== `"data:image/png;base64,"` ? mobList()?.[0]?.image.dataUrl : defaultImage.dataUrl})`,
                  "background-position": "center center",
                }}
              >
                <div class="mask hidden h-full flex-col justify-center gap-2 bg-brand-color-3rd p-8 text-primary-color lg:flex">
                  <span class="text-3xl font-bold">Top.3</span>
                  <div class="h-[1px] w-[110px] bg-primary-color"></div>
                  <span class="text-xl">{mobList()?.[2]?.name}</span>
                </div>
              </div>
            </div>
          </Motion.div>
        </Show>
      </Presence>
      <div class="Table&News flex flex-1 flex-col gap-3 overflow-hidden p-3 lg:flex-row">
        <div class="TableModule flex flex-1 flex-col overflow-hidden">
          <div class="Title hidden h-12 w-full items-center gap-3 lg:flex">
            <div class={`Text text-xl ${isFormFullscreen() ? "lg:hidden lg:opacity-0" : ""}`}>
              {dictionary().ui.mob.table.title}
            </div>
            <div
              class={`Description flex-1 rounded bg-area-color p-3 opacity-0 ${isFormFullscreen() ? "lg:opacity-100" : "lg:opacity-0"}`}
            >
              {dictionary().ui.mob.table.description}
            </div>
            <Button
              level="quaternary"
              onClick={() => {
                setIsFormFullscreen(!isFormFullscreen());
              }}
            >
              {isFormFullscreen() ? <Icon.Line.Collapse /> : <Icon.Line.Expand />}
            </Button>
          </div>
          <Show when={table()}>
            <OverlayScrollbarsComponent
              element="div"
              options={{ scrollbars: { autoHide: "scroll" } }}
              ref={setVirtualScrollElement}
            >
              {/* <div ref={virtualScrollElement!} class="TableBox VirtualScroll overflow-auto flex-1"> */}
              <table class="Table relative w-full">
                <thead class={`TableHead sticky top-0 z-10 flex`}>
                  <For each={table()!.getHeaderGroups()}>
                    {(headerGroup) => (
                      <tr class="flex min-w-full gap-0 border-b-2 border-dividing-color">
                        <For each={headerGroup.headers}>
                          {(header) => {
                            const { column } = header;
                            if (mobTableHiddenData.includes(column.id as keyof Mob)) {
                              // 默认隐藏的数据
                              return;
                            }
                            return (
                              <th
                                style={{
                                  ...getCommonPinningStyles(column),
                                  width: getCommonPinningStyles(column).width + "px",
                                }}
                                class="flex flex-col"
                              >
                                <div
                                  {...{
                                    onClick: header.column.getToggleSortingHandler(),
                                  }}
                                  class={`flex-1 py-4 text-left font-normal hover:bg-area-color ${isFormFullscreen() ? "lg:py-6" : "lg:py-3"} ${
                                    header.column.getCanSort() ? "cursor-pointer select-none" : ""
                                  }`}
                                >
                                  {MobDic(store.settings.language)[column.id as keyof Mob] as string}
                                  {{
                                    asc: " ↓",
                                    desc: " ↑",
                                  }[header.column.getIsSorted() as string] ?? null}
                                </div>
                              </th>
                            );
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </thead>
                <tbody style={{ height: `${virtualizer()?.getTotalSize()}px` }} class={`TableBodyrelative`}>
                  <For each={virtualizer()?.getVirtualItems()}>
                    {(virtualRow) => {
                      const row = table()!.getRowModel().rows[virtualRow.index];
                      return (
                        <tr
                          data-index={virtualRow.index}
                          // ref={(node) => virtualizer.measureElement(node)}
                          style={{
                            position: "absolute",
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          class={`group flex cursor-pointer border-b border-area-color transition-none hover:rounded hover:border-transparent hover:bg-area-color hover:font-bold`}
                          onMouseDown={(e) => handleMouseDown(row.getValue("id"), e)}
                        >
                          <For each={row.getVisibleCells()}>
                            {(cell) => {
                              const { column } = cell;
                              if (mobTableHiddenData.includes(column.id as keyof Mob)) {
                                // 默认隐藏的数据
                                return;
                              }

                              let tdContent: JSX.Element;

                              switch (cell.column.id as Exclude<keyof Mob, keyof typeof mobTableHiddenData>) {
                                case "name":
                                  tdContent = (
                                    <>
                                      <span class="pb-1">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                      </span>
                                      <span class="text-sm font-normal text-mainText-color">
                                        {row.getValue("belongToZones") ?? "无"}
                                      </span>
                                    </>
                                  );
                                  break;

                                case "element":
                                  {
                                    const icon =
                                      {
                                        Water: <Icon.Element.Water class="h-12 w-12" />,
                                        Fire: <Icon.Element.Fire class="h-12 w-12" />,
                                        Earth: <Icon.Element.Earth class="h-12 w-12" />,
                                        Wind: <Icon.Element.Wind class="h-12 w-12" />,
                                        Light: <Icon.Element.Light class="h-12 w-12" />,
                                        Dark: <Icon.Element.Dark class="h-12 w-12" />,
                                        Normal: <Icon.Element.NoElement class="h-12 w-12" />,
                                      }[cell.getValue() as Enums.ElementType] ?? undefined;
                                    tdContent = icon;
                                  }
                                  break;

                                // 以下值需要添加百分比符号
                                case "physicalResistance":
                                case "magicalResistance":
                                case "dodge":
                                case "block":
                                case "normalAttackResistanceModifier":
                                case "physicalAttackResistanceModifier":
                                case "magicalAttackResistanceModifier":
                                  tdContent = <>{flexRender(cell.column.columnDef.cell, cell.getContext())}%</>;
                                  break;

                                case "criticalResistance":

                                default:
                                  try {
                                    const content =
                                      dictionary().enums[
                                        (cell.column.id.charAt(0).toLocaleUpperCase() +
                                          cell.column.id.slice(1)) as keyof typeof Enums
                                      ][cell.getValue() as keyof (typeof Enums)[keyof typeof Enums]];
                                    tdContent = content;
                                  } catch (error) {
                                    tdContent = flexRender(cell.column.columnDef.cell, cell.getContext());
                                  }
                                  break;
                              }

                              return (
                                <td
                                  style={{
                                    ...getCommonPinningStyles(column),
                                    width: getCommonPinningStyles(column).width + "px",
                                  }}
                                  class={"flex flex-col justify-center py-6"}
                                >
                                  {tdContent}
                                </td>
                              );
                            }}
                          </For>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
              {/* </div> */}
            </OverlayScrollbarsComponent>
          </Show>
        </div>
        <Presence exitBeforeEnter>
          <Show when={!isFormFullscreen()}>
            <Motion.div
              animate={{ opacity: [0, 1] }}
              exit={{ opacity: 0 }}
              class="News hidden w-[248px] flex-initial flex-col gap-2 lg:flex"
            >
              <div class="Title flex h-12 text-xl">{dictionary().ui.mob.news.title}</div>
              <div class="Content flex flex-1 flex-col bg-area-color"></div>
            </Motion.div>
          </Show>
        </Presence>
      </div>
      <Dialog state={dialogState()} setState={setDialogState}>
        {"emmm..."}
      </Dialog>
    </main>
  );
}