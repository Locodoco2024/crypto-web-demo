// 1.預設匯出組件，import 時可自訂名稱
export default function ComponentName() {
  return <div>組件命名範例</div>;
}
// 補充
// page.tsx 是根頁面
// layout.tsx 是頁面結構(Navigation bar、Footer等)

// 2.具名匯出組件，import 時須使用相同名稱
// export const ComponentName2 = () => {
//   return <div>組件命名範例2</div>;
// };

// 3.具名匯出組件並預設匯出，import 時可自訂名稱
// const ComponentName3 = () => {
//   return <div>組件命名範例3</div>;
// };
// export default ComponentName3;
