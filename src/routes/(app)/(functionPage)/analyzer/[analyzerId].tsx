import { type computeInput, type computeOutput, type tSkill, dynamicTotalValue, type FrameData } from "./worker";
import { ObjectRenderer } from "./objectRender";
import { SelectMonster } from "~/schema/monster";
import { defaultSelectCharacter, SelectCharacter } from "~/schema/character";
import { defaultSelectStatistics } from "~/schema/statistics";
import { defaultSelectModifiersList } from "~/schema/modifiers_list";
import { defaultSelectConsumable } from "~/schema/consumable";
import { defaultSelectSkill } from "~/schema/skill";
import { defaultSelectPet } from "~/schema/pet";
import { Accessor, createEffect, createMemo, createSignal, For, JSX, onMount, Show } from "solid-js";
import { getDictionary } from "~/locales/i18n";
import { setStore, store } from "~/store";
import { generateAugmentedMonsterList, generateMonsterByStar } from "~/lib/untils/monster";
import Button from "~/components/ui/button";
import Dialog from "~/components/ui/dialog";
import FlowEditor from "~/components/module/flowEditor";
import { SelectAnalyzer } from "~/schema/analyzer";
import { useParams } from "@solidjs/router";
import * as Icon from "~/lib/icon";
import { defaultSelectImage } from "~/schema/image";
import { defaultSelectMember, SelectMember } from "~/schema/member";
import { $Enums } from "~/schema/enums";
import * as _ from "lodash-es";
import {
  BranchedStep,
  Definition,
  Designer,
  PropertyValue,
  RootEditorContext,
  SequentialStep,
  Step,
  StepEditorContext,
  StepsConfiguration,
  ToolboxConfiguration,
  ValidatorConfiguration,
} from "sequential-workflow-designer";
import { createId } from "@paralleldrive/cuid2";
import { type MathNode, all, create, floor, max, min, parse } from "mathjs";
import { RootEditorWrapperContext } from "~/components/module/flowEditor/RootEditorWrapper";
import Input from "~/components/ui/input";
import { render } from "solid-js/web";
import { StepEditorWrapperContext } from "~/components/module/flowEditor/StepEditorWrapper";

const externalEditorClassName = "sqd-editor-solid";

export type skillSequenceList = {
  name: string;
  data: tSkill[];
};

// 随机种子设置
const randomSeed: null | string = null;

// 验证 `all` 是否为有效的 FactoryFunctionMap 对象
if (!all) {
  throw new Error("all is undefined. Make sure you are importing it correctly.");
}

const math = create(all, {
  epsilon: 1e-12,
  matrix: "Matrix",
  number: "number",
  precision: 64,
  predictable: false,
  randomSeed: randomSeed,
});

// math函数计算上下文
const scope = new Map();
// 自定义计算函数
const cEvaluate = (formula: string) => {
  const result = math.evaluate(formula, scope);
  console.log({ formula, scope, result });
  return result;
};

// 运算数据类型定义
interface TextStepProperties extends Record<string, PropertyValue> {
  message: string;
}
interface MathStepProperties extends Record<string, PropertyValue> {
  formula: string;
}
interface BranchesStepProperties extends Record<string, PropertyValue> {
  condition: string;
}
interface LoopStepProperties extends Record<string, PropertyValue> {
  condition: string;
}

// 步骤属性定义
interface CustomTextStep extends Step {
  properties: TextStepProperties;
}
interface CustomMathStep extends Step {
  properties: MathStepProperties;
}
interface CustomBranchStep extends BranchedStep {
  properties: BranchesStepProperties;
  branches: {
    [branchName: string]: CustomStateMachineStep[];
  };
}
interface CustomSequentialStep extends SequentialStep {
  properties: LoopStepProperties;
  sequence: CustomStateMachineStep[];
}

export type CustomStateMachineStep = Step | CustomMathStep | CustomBranchStep | CustomSequentialStep;

export class StateMachineSteps {
  static createIfStep(
    name: string,
    properties: BranchesStepProperties,
    trueSteps: CustomStateMachineStep[],
    falseSteps: CustomStateMachineStep[],
  ): CustomBranchStep {
    return {
      id: createId(),
      componentType: "switch",
      type: "if",
      name,
      branches: {
        true: trueSteps || [],
        false: falseSteps || [],
      },
      properties,
    };
  }

  static createLoopStep(
    name: string,
    properties: LoopStepProperties,
    steps: CustomStateMachineStep[],
  ): CustomSequentialStep {
    return {
      id: createId(),
      componentType: "container",
      type: "loop",
      name,
      sequence: steps ?? [],
      properties,
    };
  }

  static createTaskStep(name: string, type: string, properties: MathStepProperties | TextStepProperties): Step {
    return {
      id: createId(),
      componentType: "task",
      type,
      name,
      properties,
    };
  }
}

function isTextStep(step: CustomStateMachineStep): step is CustomTextStep {
  let condition: boolean = "message" in step.properties;
  condition = step.type === "message";
  return condition;
}
function isMathStep(step: CustomStateMachineStep): step is CustomMathStep {
  let condition: boolean = "formula" in step.properties;
  return condition;
}
function isIfStep(step: CustomStateMachineStep): step is CustomBranchStep {
  let condition: boolean = "branches" in step && step.type === "if";
  return condition;
}
function isLoopStep(step: CustomStateMachineStep): step is CustomSequentialStep {
  let condition: boolean = step.type === "loop";
  return condition;
}

class Steps {
  static createMathStep(name: string, formula: string) {
    return StateMachineSteps.createTaskStep(name + formula, "calculation", {
      formula,
    });
  }

  static createTextStep(message: string) {
    return StateMachineSteps.createTaskStep(message, "message", {
      message: message,
    });
  }

  static createIfStep(
    name: string,
    condition: string,
    trueSteps?: CustomStateMachineStep[],
    falseSteps?: CustomStateMachineStep[],
  ) {
    return StateMachineSteps.createIfStep(
      name + condition,
      {
        condition,
      },
      trueSteps ?? [],
      falseSteps ?? [],
    );
  }

  static createLoopStep(name: string, condition: string, steps?: CustomStateMachineStep[]) {
    return StateMachineSteps.createLoopStep(
      name + condition,
      {
        condition,
      },
      steps ?? [],
    );
  }
}

class StateMachine<TDefinition extends Definition> {
  designer: Designer<TDefinition>;
  data: { [key: string]: number };
  callstack: {
    sequence: CustomStateMachineStep[];
    index: number;
    unwind: () => void;
  }[];
  isRunning: boolean;
  isInterrupted = false;
  consoles: string;

  constructor(designer: Designer<TDefinition>) {
    this.designer = designer;
    this.data = {};
    this.consoles = "Consoles:";
    this.callstack = [
      {
        sequence: this.designer.getDefinition().sequence,
        index: 0,
        unwind: () => {},
      },
    ];
    this.isRunning = false;
  }

  unwindStack() {
    this.callstack.pop();
  }

  executeIfStep(step: CustomBranchStep) {
    const value = this.executeIf(step);
    this.callstack.push({
      sequence: value ? step.branches.true : step.branches.false,
      index: 0,
      unwind: this.unwindStack.bind(this),
    });
  }

  executeLoopStep(step: CustomSequentialStep) {
    const program = {
      sequence: step.sequence,
      index: 0,
      unwind: () => {
        if (this.canReplyLoopStep(step)) {
          program.index = 0;
        } else {
          this.unwindStack();
        }
      },
    };
    this.callstack.push(program);
  }

  executeStep(step: CustomStateMachineStep) {
    if (isTextStep(step)) {
      this.consoles += "\r\n" + step.properties.message;
      return;
    }
    if (isMathStep(step)) {
      const formula = step.properties.formula;
      cEvaluate(formula);
    }
  }

  execute() {
    if (this.isInterrupted) {
      this.onInterrupted();
      return;
    }

    const depth = this.callstack.length - 1;
    const program = this.callstack[depth];
    if (program.sequence.length === program.index) {
      if (depth > 0) {
        program.unwind();
        this.execute();
      } else {
        this.isRunning = false;
        this.onFinished();
      }
      return;
    }

    const step = program.sequence[program.index];
    program.index++;

    switch (step.type) {
      case "if":
        isIfStep(step) && this.executeIfStep(step);
        break;
      case "loop":
        isLoopStep(step) && this.executeLoopStep(step);
        break;
      default:
        this.executeStep(step);
        break;
    }

    // this.execute.bind(this);
    setTimeout(this.execute.bind(this), this.designer.getDefinition().properties.speed as number);
    this.afterStepExecution(step);
  }

  start() {
    if (this.isRunning) {
      throw new Error("Already running");
    }
    this.isRunning = true;
    this.callstack[0].index = 0;
    this.execute();
  }

  interrupt() {
    if (!this.isRunning) {
      throw new Error("Not running");
    }
    this.isInterrupted = true;
  }

  executeIf(step: CustomBranchStep) {
    return cEvaluate(step.properties.condition) === true;
  }

  canReplyLoopStep(step: CustomSequentialStep) {
    return cEvaluate(step.properties.condition) === true;
  }

  afterStepExecution(step: Step) {
    this.designer.selectStepById(step.id);
    this.designer.moveViewportToStep(step.id);
  }

  onFinished() {}

  onInterrupted() {}
}

export default function AnalyzerIndexClient() {
  const params = useParams();
  const [dictionary, setDictionary] = createSignal(getDictionary("en"));

  createEffect(() => {
    setDictionary(getDictionary(store.settings.language));
  });

  const calculatorWorker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });

  // 状态管理参数
  const monsterList = store.monsterPage.monsterList;
  const setMonsterList = (value: SelectMonster[]) => setStore("monsterPage", "monsterList", value);
  const characterList = store.characterPage.characterList;
  const setCharacterList = (value: SelectCharacter[]) => setStore("characterPage", "characterList", value);
  const analyzeList = store.analyzerPage.analyzerList;
  const setAnalyzeList = (value: SelectAnalyzer[]) => setStore("analyzerPage", "analyzerList", value);
  const analyzer = store.analyzer;
  const setAnalyze = (value: SelectAnalyzer) => setStore("analyzer", value);
  const [memberIndex, setMemberIndex] = createSignal(0);

  const [designer, setDesigner] = createSignal<Designer<WorkflowDefinition> | null>(null);
  const [placeholder, setPlaceholder] = createSignal<HTMLElement | null>(null);
  const [isToolboxCollapsed, setIsToolboxCollapsed] = createSignal(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = createSignal(false);
  const [isReadonly, setIsReadonly] = createSignal(false);

  function rootEditorProvider(def: WorkflowDefinition, context: RootEditorContext, isReadonly: boolean) {
    const container = document.createElement("div");
    container.className = externalEditorClassName;
    render(
      () => (
        <RootEditorWrapperContext definition={def} context={context} isReadonly={isReadonly}>
          <div class="RootEditor">
            <h4>状态机信息</h4>
            <p>
              <label>速度(毫秒)</label>
              <Input
                onChange={(e) => {
                  def.properties.speed = parseInt(e.target.value);
                  context.notifyPropertiesChanged();
                }}
                value={def.properties.speed?.toString() ?? ""}
                readOnly={isReadonly}
                type="text"
              />
            </p>
          </div>
        </RootEditorWrapperContext>
      ),
      container,
    );
    return container;
  }

  function stepEditorProvider(step: Step, context: StepEditorContext, def: Definition, isReadonly: boolean) {
    const container = document.createElement("div");
    container.className = externalEditorClassName;
    render(
      () => (
        <StepEditorWrapperContext step={step} definition={def} context={context} isReadonly={isReadonly}>
          <div class="StepEditor">
            <h4>{"Step " + step.type}</h4>
            <p>
              <label>名称</label>
              <Input
                onInput={(e) => {
                  step.name = e.target.value;
                  context.notifyNameChanged();
                }}
                value={step.name?.toString()}
                readOnly={isReadonly}
                type="text"
              />
            </p>
            <For each={["formula", "condition", "message"]}>
              {(key) => (
                <Show when={step.properties[key] !== undefined}>
                  <p>
                    <label>{key}</label>
                    <Input
                      onInput={(e) => {
                        step.properties[key] = e.target.value;
                        context.notifyPropertiesChanged();
                      }}
                      value={step.properties[key]?.toString()}
                      readOnly={isReadonly}
                      type="text"
                    />
                  </p>
                </Show>
              )}
            </For>
          </div>
        </StepEditorWrapperContext>
      ),
      container,
    );

    return container;
  }

  const toolboxConfiguration: Accessor<ToolboxConfiguration> = createMemo(() => ({
    groups: [
      {
        name: "数学模块",
        steps: [Steps.createMathStep("自定义公式", ""), Steps.createTextStep("消息模块")],
      },
      {
        name: "逻辑模块",
        steps: [Steps.createIfStep("If", ""), Steps.createLoopStep("Loop", "")],
      },
    ],
  }));
  const stepsConfiguration: Accessor<StepsConfiguration> = createMemo(() => ({
    /* ... */
  }));
  const validatorConfiguration: Accessor<ValidatorConfiguration> = createMemo(() => ({
    step: (step) => {
      return Object.keys(step.properties).every((n) => !!step.properties[n]);
    },
    root: (definition) => {
      return (definition.properties["speed"] as number) > 0;
    },
  }));

  let SM: StateMachine<WorkflowDefinition> | null = null;

  const defaultStarArray: number[] = [];
  analyzer.mobs.forEach((mob) => {
    defaultStarArray.push(mob.star);
  });
  const [starArray, setStarArray] = createSignal(defaultStarArray);
  const [dialogState, setDialogState] = createSignal(true); // 避免流程设计器初始化因没有父级元素失败

  const test = {
    member: {
      id: "",
      character: {
        id: "",
        characterType: "Tank",
        name: "测试机体",
        lv: 265,
        baseStr: 1,
        baseInt: 440,
        baseVit: 1,
        baseAgi: 1,
        baseDex: 247,
        specialAbiType: "NULL",
        specialAbiValue: 0,
        mainWeapon: {
          id: "",
          name: "暴击残酷之翼",
          mainWeaponType: "MAGIC_DEVICE",
          baseAtk: 194,
          refinement: 15,
          stability: 70,
          element: "LIGHT",
          crystal: [
            {
              id: "",
              name: "寄生甲兽",
              crystalType: "WEAPONCRYSTAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "寄生甲兽",
                modifiers: [
                  {
                    id: "",
                    formula: "mAtk + 5%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "mPie + 20",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "cspd - 15%",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
            {
              id: "",
              name: "死灵妖兔II",
              crystalType: "WEAPONCRYSTAL",
              front: 1,
              modifiersList: {
                id: "",
                name: "死灵妖兔II",
                modifiers: [
                  {
                    id: "",
                    formula: "mAtk + 7%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "cspd + 14%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "maxHp - 15%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "am + 3",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
          ],
          modifiersList: {
            id: "",
            name: "暴击残酷之翼属性",
            modifiers: [
              {
                id: "",
                formula: "mAtk + 6%",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "pCr + 25",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "pCd + 21",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "stro.DARK + 21",
                belongToModifiersListId: "",
              },
            ],
          },
          modifiersListId: "",
          createdAt: new Date(),
          createdByUserId: "",
          updatedAt: new Date(),
          updatedByUserId: "",
          extraDetails: "",
          dataSources: "",
          statistics: defaultSelectStatistics,
          statisticsId: "",
        },
        mainWeaponId: "",
        subWeapon: {
          id: "",
          name: "忍术卷轴·风遁术",
          subWeaponType: "NO_WEAPON",
          baseAtk: 0,
          refinement: 0,
          stability: 0,
          element: "NO_ELEMENT",
          modifiersList: {
            id: "",
            name: "忍术卷轴·风遁术属性",
            modifiers: [
              {
                id: "",
                formula: "aspd + 300",
                belongToModifiersListId: "",
              },
            ],
          },
          modifiersListId: "",
          createdAt: new Date(),
          createdByUserId: "",
          updatedAt: new Date(),
          updatedByUserId: "",
          extraDetails: "",
          dataSources: "",
          statistics: defaultSelectStatistics,
          statisticsId: "",
        },
        subWeaponId: "",
        bodyArmor: {
          id: "",
          name: "冒险者服装",
          bodyArmorType: "NORMAL",
          refinement: 0,
          baseDef: 0,
          crystal: [
            {
              id: "",
              name: "铁之女帝",
              crystalType: "GENERAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "铁之女帝",
                modifiers: [
                  {
                    id: "",
                    formula: "mAtk + 5%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "mPie + 10",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "cspd + 20%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "maxMp - 300",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
            {
              id: "",
              name: "约尔拉兹",
              crystalType: "GENERAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "约尔拉兹",
                modifiers: [
                  {
                    id: "",
                    formula: "mAtk + 7%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "int + 3%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "cspd + 35%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "ampr + 10%",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
          ],
          modifiersList: {
            id: "",
            name: "冒险者服装属性",
            modifiers: [
              {
                id: "",
                formula: "pCr + 25",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "pCd + 10%",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "pCd + 21",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "stro.DARK + 21",
                belongToModifiersListId: "",
              },
            ],
          },
          modifiersListId: "",
          createdAt: new Date(),
          createdByUserId: "",
          updatedAt: new Date(),
          updatedByUserId: "",
          extraDetails: "",
          dataSources: "",
          statistics: defaultSelectStatistics,
          statisticsId: "",
        },
        bodyArmorId: "",
        additionalEquipment: {
          id: "",
          name: "饼干腰翼",
          refinement: 0,
          crystal: [
            {
              id: "",
              name: "深谋的青影",
              crystalType: "GENERAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "深谋的青影",
                modifiers: [
                  {
                    id: "",
                    formula: "nDis + 8%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "fDis + 8%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "maxMp - 150",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "uAtk + 8%",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
            {
              id: "",
              name: "蜜爱丽",
              crystalType: "GENERAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "蜜爱丽属性",
                modifiers: [
                  {
                    id: "",
                    formula: "",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
          ],
          modifiersList: {
            id: "",
            name: "饼干腰翼属性",
            modifiers: [
              {
                id: "",
                formula: "fDis + 10%",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "dex + 5%",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "mPie + isMAGIC_DEVICE(mainWeapon) ?  25 : 0",
                belongToModifiersListId: "",
              },
            ],
          },
          modifiersListId: "",
          createdAt: new Date(),
          createdByUserId: "",
          updatedAt: new Date(),
          updatedByUserId: "",
          extraDetails: "",
          dataSources: "",
          statistics: defaultSelectStatistics,
          statisticsId: "",
        },
        additionalEquipmentId: "",
        specialEquipment: {
          id: "",
          name: "读星提灯",
          crystal: [
            {
              id: "",
              name: "星之魔导士",
              crystalType: "GENERAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "星之魔导士",
                modifiers: [
                  {
                    id: "",
                    formula: "mAtk + 9%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "cspd + 9%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "anticipate + 9%",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
            {
              id: "",
              name: "塔图罗基特",
              crystalType: "GENERAL",
              front: 0,
              modifiersList: {
                id: "",
                name: "塔图罗基特属性",
                modifiers: [
                  {
                    id: "",
                    formula: "pAtk + 6%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "mAtk + 6%",
                    belongToModifiersListId: "",
                  },
                  {
                    id: "",
                    formula: "am + 2",
                    belongToModifiersListId: "",
                  },
                ],
              },
              modifiersListId: "",
              createdAt: new Date(),
              createdByUserId: "",
              updatedAt: new Date(),
              updatedByUserId: "",
              extraDetails: "",
              dataSources: "",
              statistics: defaultSelectStatistics,
              statisticsId: "",
            },
          ],
          modifiersList: {
            id: "",
            name: "读星提灯属性",
            modifiers: [
              {
                id: "",
                formula: "mPie + 10",
                belongToModifiersListId: "",
              },
              {
                id: "",
                formula: "maxMp + 300",
                belongToModifiersListId: "",
              },
            ],
          },
          modifiersListId: "",
          createdAt: new Date(),
          createdByUserId: "",
          updatedAt: new Date(),
          updatedByUserId: "",
          extraDetails: "",
          dataSources: "",
          statistics: defaultSelectStatistics,
          statisticsId: "",
        },
        specialEquipmentId: "",
        fashion: defaultSelectModifiersList,
        fashionModifiersListId: "",
        cuisine: defaultSelectModifiersList,
        CuisineModifiersListId: "",
        consumableList: [defaultSelectConsumable],
        skillList: [defaultSelectSkill],
        combos: [],
        pet: defaultSelectPet,
        petId: defaultSelectPet.id,
        modifiersList: defaultSelectModifiersList,
        modifiersListId: defaultSelectModifiersList.id,
        createdAt: new Date(),
        createdByUserId: "",
        updatedAt: new Date(),
        updatedByUserId: "",
        extraDetails: "",
        statistics: defaultSelectStatistics,
        statisticsId: "",
        imageId: "",
      } satisfies SelectCharacter,
      characterId: "",
      flow: [
        {
          id: "systemStart",
          componentType: "task",
          type: "message",
          name: "开始!",
          properties: { message: "开始!" },
        },
        {
          id: "systemEnd",
          componentType: "task",
          type: "message",
          name: "结束",
          properties: { message: "结束" },
        },
      ],
    } satisfies SelectMember,
    monster: {
      id: "",
      image: defaultSelectImage,
      imageId: "",
      name: "岩龙菲尔岑 四星",
      monsterType: "COMMON_BOSS",
      baseLv: 251,
      experience: 0,
      address: "",
      element: "EARTH",
      radius: 2,
      maxhp: 31710000,
      physicalDefense: 6330,
      physicalResistance: 8,
      magicalDefense: 4434,
      magicalResistance: 8,
      criticalResistance: 20,
      avoidance: 1896,
      dodge: 2,
      block: 8,
      normalAttackResistanceModifier: 0,
      physicalAttackResistanceModifier: 0,
      magicalAttackResistanceModifier: 0,
      difficultyOfTank: 5,
      difficultyOfMelee: 5,
      difficultyOfRanged: 5,
      possibilityOfRunningAround: 0,
      dataSources: "",
      createdAt: new Date(),
      createdByUserId: "",
      updatedAt: new Date(),
      updatedByUserId: "",
      extraDetails: "",
      statistics: defaultSelectStatistics,
      statisticsId: "",
    } satisfies SelectMonster,
    skillSequence1: {
      name: "skillSequence1",
      data: [
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "神速掌握",
          skillDescription: "",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "13",
            actionModifiableDurationFormula: "48",
            skillExtraActionType: "None",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "0",
            skillStartupFramesFormula: "13",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "100",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "角色行动速度+10%",
                yieldType: "ImmediateEffect",
                yieldFormula: "p.am + 10",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              {
                id: "",
                name: "角色攻速+300",
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
                yieldFormula: "p.aspd + 300",
                skillEffectId: null,
              },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "神速掌握",
          skillDescription: "",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "13",
            actionModifiableDurationFormula: "48",
            skillExtraActionType: "None",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "0",
            skillStartupFramesFormula: "13",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "100",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "角色行动速度+10%",
                yieldType: "ImmediateEffect",
                yieldFormula: "p.am + 10",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              {
                id: "",
                name: "角色攻速+300",
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
                yieldFormula: "p.aspd + 300",
                skillEffectId: null,
              },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "神速掌握",
          skillDescription: "",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "13",
            actionModifiableDurationFormula: "48",
            skillExtraActionType: "None",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "0",
            skillStartupFramesFormula: "13",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "100",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "角色行动速度+10%",
                yieldType: "ImmediateEffect",
                yieldFormula: "p.am + 10",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              {
                id: "",
                name: "角色攻速+300",
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
                yieldFormula: "p.aspd + 300",
                skillEffectId: null,
              },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "魔法炮充填",
          skillDescription: "",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "13",
            actionModifiableDurationFormula: "48",
            skillExtraActionType: "Chanting",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "0",
            skillStartupFramesFormula: "0",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "0",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "添加魔法炮层数计数器",
                yieldType: "ImmediateEffect",
                yieldFormula: "p.mfp = 0",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              {
                id: "",
                name: "魔法炮层数自动增长行为",
                yieldType: "PersistentEffect",
                mutationTimingFormula: "frame % 60 == 0 and frame > 0",
                yieldFormula: "p.mfp + ( p.mfp >= 100 ? 1/3 : 1 )",
                skillEffectId: null,
              },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "勇气源泉",
          skillDescription: "",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "23",
            actionModifiableDurationFormula: "148",
            skillExtraActionType: "Chanting",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "1",
            skillStartupFramesFormula: "",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "400",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "角色最终伤害+20%",
                yieldType: "ImmediateEffect",
                yieldFormula: "p.final + 20",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              {
                id: "",
                name: "角色武器攻击+30%",
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
                yieldFormula: "p.weaponAtk + 30%",
                skillEffectId: null,
              },
              {
                id: "",
                name: "角色命中-50%",
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
                yieldFormula: "p.hit - 50%",
                skillEffectId: null,
              },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "冲击波",
          skillDescription: "",
          level: 7,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "13",
            actionModifiableDurationFormula: "48",
            skillExtraActionType: "Chanting",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "max(0,min((2 - (p.lv - 1) * 0.25),(1 - (p.lv - 5) * 0.5)))",
            skillStartupFramesFormula: "0",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "p.mp = p.mp - 200",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "Damage",
                yieldType: "ImmediateEffect",
                yieldFormula: "m.hp - (s.vMatk + 200) * 5",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              // {
              //   id: "",
              //   name: "MP Cost half",
              //   yieldType: "PersistentEffect",
              //   yieldFormula: "",
              //   skillEffectId: null,
              //   mutationTimingFormula: "false",
              // },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "爆能",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillDescription: "",
          skillEffect: {
            id: "",
            actionBaseDurationFormula: "24",
            actionModifiableDurationFormula: "98",
            skillExtraActionType: "Chanting",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "8",
            skillStartupFramesFormula: "0",
            belongToskillId: "",
            description: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "p.mp = p.mp - 500",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                yieldFormula: "1+1",
                name: "Damage",
                skillEffectId: null,
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
              },
            ],
          },
        },
      ],
    } satisfies skillSequenceList,
    skillSequence2: {
      name: "skillSequence2",
      data: [
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "冲击波",
          skillDescription: "",
          level: 7,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillEffect: {
            id: "",
            description: "",
            actionBaseDurationFormula: "13",
            actionModifiableDurationFormula: "48",
            skillExtraActionType: "Chanting",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "max(0,min((2 - (p.lv - 1) * 0.25),(1 - (p.lv - 5) * 0.5)))",
            skillStartupFramesFormula: "0",
            belongToskillId: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "p.mp = p.mp - 200",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                name: "Damage",
                yieldType: "ImmediateEffect",
                yieldFormula: "m.hp - (s.vMatk + 200) * 5",
                mutationTimingFormula: null,
                skillEffectId: null,
              },
              // {
              //   id: "",
              //   name: "MP Cost half",
              //   yieldType: "PersistentEffect",
              //   yieldFormula: "",
              //   skillEffectId: null,
              //   mutationTimingFormula: "false",
              // },
            ],
          },
        },
        {
          id: "",
          state: "PUBLIC",
          skillTreeName: "MAGIC",
          name: "爆能",
          level: 10,
          weaponElementDependencyType: "TRUE",
          element: "NO_ELEMENT",
          skillType: "ACTIVE_SKILL",
          skillDescription: "",
          skillEffect: {
            id: "",
            actionBaseDurationFormula: "24",
            actionModifiableDurationFormula: "98",
            skillExtraActionType: "Chanting",
            chargingBaseDurationFormula: "0",
            chargingModifiableDurationFormula: "0",
            chantingBaseDurationFormula: "0",
            chantingModifiableDurationFormula: "8",
            skillStartupFramesFormula: "0",
            belongToskillId: "",
            description: "",
            skillCost: [
              {
                id: "",
                name: "MP Cost",
                costFormula: "p.mp = p.mp - 500",
                skillEffectId: null,
              },
            ],
            skillYield: [
              {
                id: "",
                yieldFormula: "1+1",
                name: "Damage",
                skillEffectId: null,
                yieldType: "ImmediateEffect",
                mutationTimingFormula: null,
              },
            ],
          },
        },
      ],
    } satisfies skillSequenceList,
  };

  interface WorkflowDefinition extends Definition {
    properties: {
      speed: number;
    };
    sequence: CustomStateMachineStep[];
  }

  const startDefinition = createMemo<WorkflowDefinition>(() => {
    console.log("更新startDefinition");
    return {
      properties: {
        speed: 300,
      },
      sequence: _.cloneDeep(analyzer.team[memberIndex()].flow as unknown as CustomStateMachineStep[]) ?? [
        Steps.createTextStep("开始!"),
        Steps.createMathStep("定义", "a = 1"),
        Steps.createMathStep("定义", "b = 2"),
        Steps.createLoopStep("循环", "a < 20", [
          Steps.createMathStep("自增", "a = a + 2"),
          Steps.createMathStep("自减", "a = a + b - 1"),
          Steps.createIfStep("如果x大于50", "a < 10", [Steps.createTextStep("yes!")], [Steps.createTextStep("no...")]),
        ]),
        Steps.createTextStep("结束"),
      ],
    };
  });

  onMount(() => {
    console.log("--Analyzer Client Render");
    setDesigner(
      Designer.create(placeholder()!, startDefinition(), {
        theme: "light",
        undoStackSize: 10,
        toolbox: toolboxConfiguration()
          ? {
              ...toolboxConfiguration(),
              isCollapsed: isToolboxCollapsed(),
            }
          : false,
        steps: stepsConfiguration(),
        validator: validatorConfiguration(),
        controlBar: true,
        contextMenu: true,
        keyboard: true,
        // preferenceStorage:,
        editors: {
          isCollapsed: isEditorCollapsed(),
          rootEditorProvider,
          stepEditorProvider,
        },
        customActionHandler: () => {},
        // extensions,
        // i18n,
        isReadonly: isReadonly(),
      }),
    );
    designer()!.onDefinitionChanged.subscribe(() => {
      const sequence = designer()?.getDefinition().sequence;
      if (sequence) {
        setStore("analyzer", "team", memberIndex(), "flow", structuredClone(sequence));
      }
    });
    designer()!.onSelectedStepIdChanged.subscribe((stepId) => {});
    designer()!.onIsToolboxCollapsedChanged.subscribe((isCollapsed) => {});
    designer()!.onIsEditorCollapsedChanged.subscribe((isCollapsed) => {});
    SM = new StateMachine<WorkflowDefinition>(designer()!);

    setTimeout(() => {
      setDialogState(false);
    }, 1);

    calculatorWorker.onmessage = (e: MessageEvent<computeOutput>) => {
      const { type, computeResult } = e.data;
    };
    calculatorWorker.onerror = (error) => {
      console.error("Worker error:", error);
    };

    return () => {
      console.log("--Analyzer Client Unmount");
      if (calculatorWorker) {
        calculatorWorker.terminate();
      }
    };
  });

  return (
    <>
      <div class="Title flex flex-col p-3 lg:pt-12">
        <div class="Content flex flex-col items-center justify-between gap-10 py-3 lg:flex-row lg:justify-start lg:gap-4">
          <h1 class="Text flex-1 text-left text-3xl lg:bg-transparent lg:text-4xl">{analyzer.name}</h1>
          <div class="Control flex gap-3">
            <Button icon={<Icon.Line.Share />}>{dictionary().ui.actions.generateImage}</Button>
            <Button icon={<Icon.Line.Save />}>{dictionary().ui.actions.save}</Button>
          </div>
        </div>
      </div>

      <div class="MobsConfig flex flex-col gap-3 p-3">
        <div class="ModuleTitle flex h-12 w-full items-center text-xl">
          {dictionary().ui.analyzer.analyzerPage.mobsConfig.title}
        </div>
        <div class="ModuleContent flex flex-col gap-6">
          <For each={analyzer.mobs}>
            {(mob, index) => {
              function setStarArr(star: number) {
                const newStarArray = [...starArray()];
                newStarArray[index()] = star;
                setStarArray(newStarArray);
              }
              return (
                <div class="flex items-center gap-6 rounded bg-accent-color bg-right shadow-card shadow-transition-color-20">
                  <div class="MobsName z-10 px-6 py-3 text-xl text-primary-color">{mob.monster.name}</div>
                  <div class="MobsConfig z-10 flex flex-1 gap-6 px-6 py-3">
                    <div
                      class="MobsAugment flex cursor-pointer items-center gap-3 rounded p-3 px-6 py-3 hover:bg-primary-color-10"
                      onMouseEnter={() => setStarArr(0)}
                      onMouseLeave={() => {
                        setStarArr(mob.star);
                      }}
                      onClick={() => setStore("analyzer", "mobs", index(), "star", starArray()[index()])}
                    >
                      <Icon.Filled.Star
                        onMouseEnter={() => setStarArr(1)}
                        class={`${starArray()[index()] >= 1 ? "text-brand-color-1st" : "text-primary-color-30"} hover:text-primary-color`}
                      />
                      <Icon.Filled.Star
                        onMouseEnter={() => setStarArr(2)}
                        class={`${starArray()[index()] >= 2 ? "text-brand-color-2nd" : "text-primary-color-30"} hover:text-primary-color`}
                      />
                      <Icon.Filled.Star
                        onMouseEnter={() => setStarArr(3)}
                        class={`${starArray()[index()] >= 3 ? "text-brand-color-3rd" : "text-primary-color-30"} hover:text-primary-color`}
                      />
                      <Icon.Filled.Star
                        onMouseEnter={() => setStarArr(4)}
                        class={`${starArray()[index()] >= 4 ? "text-brand-color-4th" : "text-primary-color-30"} hover:text-primary-color`}
                      />
                    </div>
                    <Button class="text-primary-color" icon={<Icon.Line.Swap />}>
                      {dictionary().ui.actions.swap}
                    </Button>
                    <Button class="text-primary-color" icon={<Icon.Line.ZoomIn />}>
                      {dictionary().ui.actions.checkInfo}
                    </Button>
                  </div>
                  <div
                    class="MobsBG z-0 w-1/2 self-stretch rounded"
                    style={{
                      "background-image": `url(${mob?.monster?.image?.dataUrl})`,
                      "background-position-y": "40%",
                    }}
                  >
                    <div class="Mask h-full w-1/2 bg-gradient-to-r from-accent-color to-accent-color-0"></div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      <div class="TeamConfig flex flex-col gap-3 p-3">
        <div class="ModuleTitle flex h-12 w-full items-center text-xl">
          {dictionary().ui.analyzer.analyzerPage.teamConfig.title}
        </div>
        <div class="ModuleContent flex flex-wrap gap-3">
          <For each={analyzer.team}>
            {(member, index) => {
              return (
                <div class="Member flex border-b-2 border-accent-color p-1">
                  <div
                    onClick={() => {
                      setDialogState(true);
                      setMemberIndex(index());
                      designer()?.replaceDefinition(startDefinition());
                      // const newTeam = _.cloneDeep(analyzer.team);
                      // newTeam.splice(index(), 1);
                      // setStore("analyzer", "team", newTeam);
                    }}
                    class="InfoRow cursor-pointer gap-6 rounded p-2 hover:bg-transition-color-20"
                  >
                    <div class="Info flex flex-col gap-2 px-3">
                      <div class="MemberName text-lg font-bold">{member.character.name ?? ""}</div>
                      <div class="MenberConfig flex flex-1 gap-1 text-accent-color-70">
                        <span>{member.character.lv}</span>-
                        <span>{dictionary().db.enums.MainWeaponType[member.character.mainWeapon.mainWeaponType]}</span>-
                        <span>{dictionary().db.enums.SubWeaponType[member.character.subWeapon.subWeaponType]}</span>
                      </div>
                    </div>
                    <div class="Funtion"></div>
                  </div>
                  <div class="FlowRow"></div>
                </div>
              );
            }}
          </For>

          <div class="AddMember flex p-1">
            <div
              onClick={() => setStore("analyzer", "team", analyzer.team.length, test.member)}
              class="InfoRow flex cursor-pointer items-center gap-6 rounded bg-transition-color-8 p-2 hover:bg-transition-color-20"
            >
              <div class="Info flex flex-col items-center justify-center gap-2 px-3">
                <Icon.Line.AddUser />
                <span>
                  {dictionary().ui.actions.add}
                  {dictionary().db.models.character.selfName}
                </span>
              </div>
            </div>
            <div class="FlowRow"></div>
          </div>
        </div>
      </div>

      <Dialog state={dialogState()} setState={setDialogState}>
        <div ref={setPlaceholder} id="sqd-placeholder" class="FlowEditor h-full w-full"></div>
        <div class="FunctionArea flex w-full gap-2 border-t-2 border-accent-color p-3">
          <Button
            level="primary"
            disabled={designer()?.isReadonly()}
            icon={<Icon.Line.Gamepad />}
            onClick={() => {
              SM?.start();
              designer()?.setIsReadonly(true);
            }}
          >
            测试运行
          </Button>
        </div>
      </Dialog>
    </>
  );
}