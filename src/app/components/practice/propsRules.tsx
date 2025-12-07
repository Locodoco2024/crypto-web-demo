import { useState } from "react";

// 在開頭定義子組件的props屬性類型
interface props {
  title: string;
  functionProp?: (num: number, style: string, count: number) => React.ReactNode;
  // React.ReactNode 用來表示可以被渲染的任意內容的類型，包括JSX
}

// 子組件的props使用定義的類型
export default function PropsRules(props: props) {
  const { title, functionProp } = props;
  const [count, setCount] = useState(0);
  return (
    <>
      <div>{title}</div>
      <div>子組件的count: {count}</div>
      <button onClick={() => setCount(count + 1)}>+</button>
      {functionProp?.(10, "red", count)} {/* 調用來自父組件的render props */}
    </>
  );
}
