import ComponentName from "./componentNameRules";
import PropsRules from "./propsRules";

export default function TestIndex() {
  function functionProp(num: number, color: string, count: number) {
    return (
      <>
        <div style={{ color }}>{`來自父組件的render props, num: ${num}`}</div>
        <div>{`父組件的count: ${count}`}</div>
        {/* count依賴子組件呼叫render props，從而觸發父子重新render，來達到類似子組件傳遞值給父組件，
        傳統方式可能是父子都設state，傳setFN給子組件控制 */}
      </>
    );
  }
  // 父組件傳遞functionProp給子組件PropsRules使用
  // style={{ color }} 外層 {} 用來在 JSX 中插入 JavaScript 表達式，內層 {} 用來定義一個 JavaScript 物件

  return (
    <>
      <ComponentName />
      <hr />
      <PropsRules title="傳入props標題" functionProp={functionProp} />
      <hr />
    </>
  );
}
