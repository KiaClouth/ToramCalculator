import { createEffect, createMemo, createResource, createSignal, JSX, onCleanup, onMount, Show } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import * as _ from "lodash-es";
import { evaluate } from "mathjs";

import { getDictionary, Locale } from "~/locales/i18n";
import { setStore, store } from "~/store";
import * as Icon from "~/components/icon";
import Button from "~/components/controls/button";
import { findMobs, type Mob } from "~/repositories/mob";
import { type Skill } from "~/repositories/skill";
import { findCrystals, type Crystal } from "~/repositories/crystal";
import Filing from "~/components/module/filing";

import { type SkillEffect } from "~/repositories/skillEffect";
import { Motion, Presence } from "solid-motionone";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { User } from "~/repositories/user";
import { findSimulators } from "~/repositories/simulator";
import Dialog from "~/components/controls/dialog";
import NodeEditor from "~/components/module/nodeEditor";

type Related =
  | {
      key: string;
      value: string | number;
    }
  | undefined;

type Result =
  | {
      name: string;
      relateds: Related[];
      data: Mob | Skill | Crystal;
    }
  | undefined;

export default function Index() {
  let searchButtonRef: HTMLButtonElement;
  let searchInputPCRef: HTMLInputElement;
  let searchInputMobileRef: HTMLInputElement;

  type FinalResult = Partial<Record<"mobs" | "skills" | "crystals", Result[]>>;

  const [nodeEditorDialog, setNodeEditorDialog] = createSignal(false);
  const [flowEditorDialog, setFlowEditorDialog] = createSignal(false);
  const [searchInputValue, setSearchInputValue] = createSignal("");
  const [searchResult, setSearchResult] = createSignal<FinalResult>({
    mobs: [],
    skills: [],
    crystals: [],
  });
  const [searchResultOpened, setSearchResultOpened] = createSignal(false);
  const [isNullResult, setIsNullResult] = createSignal(true);
  const [resultListSate, setResultListState] = createSignal<boolean[]>([]);
  const [currentCardId, setCurrentCardId] = createSignal<string>("defaultId");
  // UI文本字典
  const dictionary = createMemo(() => getDictionary(store.settings.language));
  // const [UserList, { refetch: refetchUserList }] = createResource(
  //   async () =>
  //     await pgWorker.live.query<User>(`select * from public.user`, [], (res) => {
  //       console.log(res);
  //     }),
  // );
  const [mobList, { refetch: refetchMobList }] = createResource(findMobs);
  const [crystalList, { refetch: refetchCrystalList }] = createResource(findCrystals);

  const skillList = (): Skill[] => {
    return [];
  };

  // 搜索函数
  const mobHiddenData: Array<keyof Mob> = ["id", "image", "imageId", "updatedByAccountId", "createdByAccountId"];
  const skillHiddenData: Array<keyof (Skill & SkillEffect)> = [
    "id",
    "belongToskillId",
    "updatedByAccountId",
    "createdByAccountId",
  ];
  const crystalHiddenData: Array<keyof Crystal> = [];

  // 对象属性字符串匹配方法
  const keyWordSearch = <T extends Record<string, unknown>>(
    obj: T,
    keyWord: string | number,
    hiddenData: string[],
    path: string[] = [],
    relateds: Related[] = [],
  ): Related[] | undefined => {
    Object.keys(obj).forEach((key) => {
      const currentPath = [...path, key];
      if (hiddenData.some((data) => data === key)) return;
      if (_.isArray(obj[key])) {
        const currentArr = obj[key] as unknown[];
        currentArr.forEach((item) => {
          const subRealateds = keyWordSearch(item as Record<string, unknown>, keyWord, hiddenData, currentPath);
          if (subRealateds) relateds = relateds.concat(subRealateds);
        });
      } else if (_.isObject(obj[key])) {
        const currentObj = obj[key] as Record<string, unknown>;
        const subRealateds = keyWordSearch(currentObj, keyWord, hiddenData, currentPath);
        if (subRealateds) relateds = relateds.concat(subRealateds);
      } else if (_.isNumber(obj[key])) {
        // console.log("数字类型：", currentPath.join("."), obj[key]);
        const value = obj[key] as number;
        if (value === keyWord) {
          relateds.push({ key: currentPath.join("."), value: value });
        } else if (typeof keyWord === "string") {
          try {
            // const node = parse(keyWord);
            // const nodeString = node.toString();
            // math表达式匹配
            // console.log("准备评估：", keyWord, "上下文为：", { [`${key}`]: value }, "节点类型为：", node.type);
            if (evaluate(keyWord, { [`${key}`]: value })) {
              relateds.push({ key: currentPath.join("."), value: value });
            }
          } catch (error) {}
        }
      } else if (_.isString(obj[key])) {
        const value = obj[key] as string;
        // console.log("字符串类型：", currentPath.join("."), obj[key]);
        if (typeof keyWord === "string") {
          // console.log("在：", value, "中寻找：", keyWord);
          if (value.match(keyWord)) {
            // console.log("符合条件");
            // 常规字符串匹配
            relateds.push({ key: currentPath.join("."), value: value });
          }
        }
      } else {
        // console.log("未知类型：", currentPath.join("."), obj[key]);
      }
    });
    if (relateds.length > 0) {
      // console.log("在：", path.join("."), "匹配的结果：", relateds);
      return relateds;
    }
  };

  // 变量对象，返回所有字符串属性值组成的数组
  function getAllValues(obj: Record<string, unknown>) {
    const values: string[] = [];

    function collectValues(o: object) {
      _.forOwn(o, (value) => {
        if (_.isObject(value) && !_.isArray(value)) {
          collectValues(value);
        } else if (_.isString(value)) {
          values.push(value);
        }
      });
    }

    collectValues(obj);
    return values;
  }

  const searchInList = <T extends Mob | Skill | Crystal>(list: T[], key: string | number, hiddenData: string[]) => {
    if (!key) return;
    const result: Result[] = [];
    list.forEach((item) => {
      keyWordSearch(item, key, hiddenData)
        ? result.push({
            name: item.name[store.settings.language],
            relateds: keyWordSearch(item, key, hiddenData)!,
            data: item,
          })
        : null;
    });
    // console.log("搜索结果：", result);
    return result;
  };

  const search = () => {
    setIsNullResult(true);
    if (searchInputValue() === "" || searchInputValue() === null) {
      // console.log("输入值为空，不处理");
      setSearchResultOpened(false);
      return;
    }
    if (!searchResultOpened()) {
      // console.log("搜索结果列表未打开，打开列表，并添加前进历史记录");
      setSearchResultOpened(true);
      history.pushState({ popup: true }, "");
    }

    const parsedInput = parseFloat(searchInputValue());
    const isNumber = !isNaN(parsedInput) && searchInputValue().trim() !== "";
    const searchValue = isNumber ? parsedInput : searchInputValue();

    const finalResult: FinalResult = {
      mobs: searchInList(mobList() ?? [], searchValue, mobHiddenData),
      skills: searchInList(skillList() ?? [], searchValue, skillHiddenData),
      crystals: searchInList(crystalList() ?? [], searchValue, crystalHiddenData),
    };
    setSearchResult(finalResult);
    // 动态初始化列表状态
    const resultListSate: boolean[] = [];
    Object.entries(finalResult).forEach(([_key, value]) => {
      if (value.length > 0) {
        setIsNullResult(false);
      }
      resultListSate.push(true);
    });
    setResultListState(resultListSate);
  };

  // 生成搜索结果列表DOM
  const generateSearchResultDom = (dialogStatus: boolean) => {
    return isNullResult() ? (
      <div
        class={`NullResult flex h-full flex-1 flex-col items-center justify-center gap-12 p-6 lg:p-0 ${
          dialogStatus ? "opacity-100" : "opacity-0"
        }`}
      >
        <span class="NullResultWarring text-xl font-bold leading-loose lg:text-2xl">
          {dictionary().ui.index.nullSearchResultWarring}
        </span>
        <p class={`NullResultTips text-center leading-loose text-mainText-color`}>
          {dictionary()
            .ui.index.nullSearchResultTips.split("\n")
            .map((line, index) => (
              <span>
                {line}
                <br />
              </span>
            ))}
        </p>
      </div>
    ) : (
      <div class={`ResultContent flex h-full flex-1 flex-col gap-2 rounded bg-area-color p-2 backdrop-blur-md`}>
        <OverlayScrollbarsComponent element="div" options={{ scrollbars: { autoHide: "scroll" } }} defer>
          {Object.entries(searchResult()).map(([key, value], groupIndex) => {
            let icon: JSX.Element = null;
            let groupName = "未知分类";
            switch (key) {
              case "skills":
                icon = <Icon.Line.Basketball />;
                groupName = dictionary().ui.nav.skills;
                break;
              case "crystals":
                icon = <Icon.Line.Box2 />;
                groupName = dictionary().ui.nav.crystals;
                break;
              case "mobs":
                icon = <Icon.Line.Calendar />;
                groupName = dictionary().ui.nav.mobs;
                break;
              default:
                break;
            }

            return (
              value.length > 0 && (
                <div class="RsultGroup flex flex-col gap-1">
                  <button
                    onClick={() =>
                      setResultListState([
                        ...resultListSate().slice(0, groupIndex),
                        !resultListSate()[groupIndex],
                        ...resultListSate().slice(groupIndex + 1),
                      ])
                    }
                    class={`Group flex cursor-pointer justify-center gap-2 bg-primary-color outline-none focus-within:outline-none ${resultListSate()[groupIndex] ? "" : ""} rounded px-3 py-4`}
                  >
                    {icon}
                    <span class="w-full text-left">
                      {groupName} [{value.length}]
                    </span>
                    {resultListSate()[groupIndex] ? (
                      <Icon.Line.Left class="rotate-[360deg]" />
                    ) : (
                      <Icon.Line.Left class="rotate-[270deg]" />
                    )}
                  </button>
                  <div class="Content flex flex-col gap-1">
                    {value.map((item, index) => {
                      return (
                        <Motion.button
                          class={`Item group flex flex-col gap-1 ${resultListSate()[groupIndex] ? "" : "hidden"} rounded border border-dividing-color bg-primary-color p-3 outline-none focus-within:bg-area-color focus-within:outline-none`}
                          animate={{
                            opacity: [0, 1],
                            transform: ["translateY(30px)", "translateY(0)"],
                          }}
                          transition={{
                            duration: store.settings.userInterface.isAnimationEnabled ? 0.7 : 0,
                            delay: store.settings.userInterface.isAnimationEnabled
                              ? index < 10
                                ? 0.3 + index * 0.07
                                : 0
                              : 0,
                          }}
                          onClick={() => {
                            if (item?.data.id === currentCardId()) {
                              setCurrentCardId("defaultId");
                            } else {
                              setCurrentCardId(item?.data.id ?? "未知ID");
                            }
                          }}
                        >
                          <div class="Name border-b-2 border-transparent p-1 font-bold group-hover:border-accent-color">
                            {item?.name}
                          </div>
                          <div class="Value flex w-full flex-col flex-wrap p-1 text-sm text-mainText-color group-hover:text-accent-color">
                            {item?.relateds.map((related, index) => {
                              return (
                                <div class="Related w-fit pr-2">
                                  <span>
                                    {related?.key}: {related?.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div
                            class={`Data ${currentCardId() === item?.data.id ? "flex" : "hidden"} w-full flex-1 flex-wrap rounded bg-area-color p-1`}
                          >
                            {JSON.stringify(_.omit(item?.data, mobHiddenData), null, 2)
                              .split(",")
                              .map((line, index) => (
                                <span class="text-left lg:basis-1/4">
                                  {line}
                                  <br />
                                </span>
                              ))}
                          </div>
                        </Motion.button>
                      );
                    })}
                  </div>
                </div>
              )
            );
          })}
        </OverlayScrollbarsComponent>
      </div>
    );
  };

  // 问候语计算方法
  const getGreetings = () => {
    const now = new Date().getHours();
    if (now >= 13 && now < 18) {
      return dictionary().ui.index.goodAfternoon;
    } else if ((now >= 18 && now < 24) || now < 5) {
      return dictionary().ui.index.goodEvening;
    } else {
      return dictionary().ui.index.goodMorning;
    }
  };

  // 键盘事件
  // const handleKeyPress = (e: KeyboardEvent) => {
  //   switch (e.key) {
  //     case "Enter":
  //       {
  //         if (document.activeElement === searchInputPCRef || document.activeElement === searchInputMobileRef) {
  //           searchButtonRef.click();
  //         }
  //       }
  //       break;
  //     case "Escape":
  //       {
  //         if (store.settingsDialogState) {
  //           setStore("settingsDialogState", false);
  //           e.stopPropagation();
  //         } else if (document.activeElement === searchInputPCRef) {
  //           searchInputPCRef.blur();
  //           e.stopPropagation();
  //         } else if (document.activeElement === searchInputMobileRef) {
  //           searchInputMobileRef.blur();
  //           e.stopPropagation();
  //         } else if (searchResultOpened()) {
  //           setSearchResultOpened(false);
  //           e.stopPropagation();
  //         }
  //         if (document.activeElement === searchInputPCRef || document.activeElement === searchInputMobileRef) {
  //           searchInputPCRef.blur();
  //           searchInputMobileRef.blur();
  //         }
  //       }
  //       break;
  //     case "s":
  //     case "S":
  //       {
  //         if (document.activeElement !== searchInputPCRef && document.activeElement !== searchInputMobileRef) {
  //           setStore("settingsDialogState", true);
  //         }
  //       }
  //       break;
  //     case "·":
  //     case "`":
  //       {
  //         if (document.activeElement !== searchInputPCRef && document.activeElement !== searchInputMobileRef) {
  //           searchInputPCRef.focus();
  //           e.preventDefault(); // 阻止默认输入行为
  //         }
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  // };

  onMount(async () => {
    // 浏览器后退事件监听
    const handlePopState = () => {
      setSearchResultOpened(false);
      history.replaceState(null, "", location.href);
    };

    // 监听绑带与清除
    // document.addEventListener("keydown", handleKeyPress);
    window.addEventListener("popstate", handlePopState);

    onCleanup(() => {
      // document.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("popstate", handlePopState);
    });
  });

  return (
    <MetaProvider>
      <Title>ToramCalculator 首页</Title>
      <Motion.div
        animate={{ opacity: [0, 1] }}
        transition={{ duration: store.settings.userInterface.isAnimationEnabled ? 0.7 : 0 }}
        class={`Client relative flex h-full w-full flex-col justify-between opacity-0`}
      >
        <div
          class={`QueryStarus text-accent-color-30 pointer-events-none absolute left-10 top-10 hidden flex-col text-xs ${searchResultOpened() ? "" : "lg:flex"}`}
        >
          <span>MobList: {mobList()?.length}</span>
          <span>SkillList: {skillList()?.length}</span>
          <span>CrystalList: {crystalList()?.length}</span>
          <span>searchResultOpened: {searchResultOpened().toString()}</span>
        </div>
        <Motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ duration: store.settings.userInterface.isAnimationEnabled ? 0.7 : 0 }}
          class={`Config absolute right-3 top-3 flex gap-1`}
        >
          <Button
            class="outline-none duration-150 focus-within:outline-none"
            level="quaternary"
            onClick={() => setNodeEditorDialog(!nodeEditorDialog())}
          >
            <Icon.Line.Basketball />
          </Button>
          <Button
            class="outline-none duration-150 focus-within:outline-none"
            level="quaternary"
            onClick={() => setStore("theme", store.theme == "dark" ? "light" : "dark")}
          >
            <Icon.Line.Light />
          </Button>
          <Button
            class="outline-none duration-150 focus-within:outline-none"
            level="quaternary"
            onClick={() => setStore("settingsDialogState", !store.settingsDialogState)}
          >
            <Icon.Line.Settings />
          </Button>
        </Motion.div>
        <div
          class={`Top flex flex-1 flex-col justify-center overflow-hidden ${searchResultOpened() ? "p-3" : "p-6"} w-full duration-700 lg:mx-auto lg:max-w-[1536px] lg:p-3`}
        >
          <div
            class={`Greetings flex flex-1 flex-col items-center justify-center gap-2 overflow-hidden duration-700 ${
              searchResultOpened() ? `basis-[0%] pb-0 opacity-0` : `basis-[100%] opacity-100 lg:flex-none lg:pb-12`
            }`}
          >
            <div class={`LogoBox mb-2 overflow-hidden rounded backdrop-blur dark:backdrop-blur-none lg:mb-0`}>
              <Icon.LogoText class="h-12 w-fit lg:h-auto" />
            </div>
            <h1 class={`py-4 text-mainText-color lg:hidden`}>
              {getGreetings() + ",  " + dictionary().ui.index.adventurer}
            </h1>
          </div>
          <div
            class={`ResultMo flex flex-1 flex-col gap-1 overflow-hidden pb-3 lg:hidden lg:flex-row ${
              searchResultOpened()
                ? `flex-shrink-1 flex-grow-1 basis-[100%]`
                : `flex-shrink-0 flex-grow-0 basis-[0%] opacity-0`
            }`}
            style={
              searchResultOpened()
                ? {
                    "clip-path": "inset(0% 0% 0% 0% round 12px)",
                    "transition-duration": "0.3s",
                    "transition-timing-function": "ease-out",
                  }
                : {
                    "clip-path": "inset(90% 5% 10% 5% round 12px)",
                    "transition-duration": "0.7s",
                    "transition-timing-function": "ease-out",
                  }
            }
          >
            {generateSearchResultDom(searchResultOpened())}
          </div>
          <div
            class={`FunctionBox flex w-full flex-col justify-between ${searchResultOpened() ? "pb-3" : ""} lg:flex-row`}
          >
            <div
              class={`BackButton m-0 hidden w-full flex-none self-start lg:m-0 lg:flex lg:w-60 ${
                searchResultOpened() ? `pointer-events-auto mt-3 opacity-100` : `pointer-events-none -mt-12 opacity-0`
              }`}
            >
              <Button
                level="quaternary"
                onClick={() => {
                  setSearchResultOpened(false);
                }}
                class="w-full outline-none focus-within:outline-none"
              >
                <Icon.Line.Back />
                <span class="w-full text-left">{dictionary().ui.actions.back}</span>
              </Button>
            </div>
            <div
              class={`SearchBox border-b-none group box-content flex w-full gap-1 border-dividing-color p-0.5 duration-500 ease-linear focus-within:border-accent-color hover:border-accent-color lg:border-b-2 lg:focus-within:px-4 lg:hover:px-4 ${searchResultOpened() ? `lg:basis-[100%]` : `lg:basis-[426px]`}`}
            >
              <input
                id="searchInput-PC"
                ref={searchInputPCRef!}
                type="text"
                placeholder={getGreetings() + "," + dictionary().ui.index.adventurer}
                value={searchInputValue()}
                tabIndex={1}
                onInput={(e) => {
                  setSearchInputValue(e.target.value);
                }}
                class="focus:placeholder:text-accent-color-0 hidden w-full flex-1 rounded px-4 py-2 text-lg font-bold mix-blend-multiply outline-none placeholder:text-base placeholder:font-normal placeholder:text-boundary-color focus-within:outline-none dark:mix-blend-normal lg:flex lg:bg-transparent"
              />
              <input
                id="searchInput-Mobile"
                ref={searchInputMobileRef!}
                type="text"
                placeholder={dictionary().ui.searchPlaceholder}
                value={searchInputValue()}
                tabIndex={1}
                onInput={(e) => {
                  setSearchInputValue(e.target.value);
                }}
                class="w-full flex-1 rounded bg-area-color px-4 py-2 text-lg font-bold mix-blend-multiply backdrop-blur placeholder:font-normal placeholder:text-boundary-color dark:mix-blend-normal lg:hidden"
              />
              <Button
                ref={(el) => (searchButtonRef = el)}
                icon={<Icon.Line.Search />}
                class="group-hover:text-accent-color lg:bg-transparent"
                onClick={search}
                tabindex={1}
              ></Button>
            </div>
            <div class="hidden w-60 flex-none lg:flex"></div>
          </div>
          <Presence exitBeforeEnter>
            <Show when={searchResultOpened()}>
              <Motion.div
                animate={{
                  clipPath: ["inset(10% 10% 90% 10% round 12px)", "inset(0% 0% 0% 0% round 12px)"],
                  opacity: [0, 1],
                  flexBasis: ["0%", "100%"],
                  flexGrow: [0, 1],
                }}
                exit={{
                  clipPath: ["inset(0% 0% 0% 0% round 12px)", "inset(10% 25% 90% 25% round 12px)"],
                  opacity: [1, 0],
                  flexBasis: ["100%", "0%"],
                  flexGrow: [1, 0],
                }}
                transition={{ duration: store.settings.userInterface.isAnimationEnabled ? 0.7 : 0 }}
                class={`ResultPC hidden lg:flex lg:h-full lg:flex-1 lg:flex-row lg:gap-1 lg:overflow-y-hidden`}
              >
                {generateSearchResultDom(searchResultOpened())}
              </Motion.div>
            </Show>
          </Presence>
        </div>

        <Presence exitBeforeEnter>
          <Show when={!searchResultOpened()}>
            <Motion.div
              animate={{
                opacity: [0, 1],
                gridTemplateRows: ["0fr", "1fr"],
              }}
              exit={{
                opacity: [1, 0],
                gridTemplateRows: ["1fr", "0fr"],
                paddingBottom: 0,
                paddingTop: 0,
              }}
              transition={{ duration: store.settings.userInterface.isAnimationEnabled ? 0.5 : 0 }}
              class={`Bottom grid w-full self-center bg-accent-color p-6 ease-linear dark:bg-area-color lg:w-fit lg:bg-transparent lg:py-20 dark:lg:bg-transparent`}
            >
              <div
                class={`Content flex flex-wrap gap-3 overflow-hidden rounded lg:flex-1 lg:justify-center lg:bg-area-color lg:backdrop-blur ${searchResultOpened() ? `lg:p-0` : `lg:p-3`}`}
              >
                <a
                  tabIndex={2}
                  href={"/wiki/mob"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Browser class="h-10 w-10 text-brand-color-1st group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.mobs}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/wiki/skill"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Basketball class="h-10 w-10 text-brand-color-2nd group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.skills}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/wiki/equipment"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Category2 class="h-10 w-10 text-brand-color-3rd group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.equipments}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/wiki/crystal"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Box2 class="h-10 w-10 text-brand-color-1st group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.crystals}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/wiki/pet"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Heart class="h-10 w-10 text-brand-color-2nd group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.pets}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/building"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Layers class="h-10 w-10 text-brand-color-3rd group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.items}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/character"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.User class="h-10 w-10 text-brand-color-1st group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.character}</span>
                  </Button>
                </a>
                <a
                  tabIndex={2}
                  href={"/simulator/defaultSimulatorId"}
                  class="flex-none basis-[calc(33.33%-8px)] overflow-hidden rounded lg:basis-auto"
                >
                  <Button
                    class="group w-full flex-col bg-primary-color-10 dark:bg-primary-color dark:text-accent-color lg:w-fit lg:flex-row lg:bg-accent-color"
                    level="primary"
                    tabIndex={-1}
                    icon={
                      <Icon.Filled.Gamepad class="h-10 w-10 text-brand-color-2nd group-hover:text-primary-color group-hover:dark:text-accent-color lg:h-6 lg:w-6" />
                    }
                  >
                    <span class="text-ellipsis text-nowrap text-sm lg:text-base">{dictionary().ui.nav.simulator}</span>
                  </Button>
                </a>
              </div>
            </Motion.div>
          </Show>
        </Presence>
      </Motion.div>
      <Filing />
            <Dialog state={nodeEditorDialog()} setState={setNodeEditorDialog}>
              <NodeEditor />
            </Dialog>
    </MetaProvider>
  );
}
