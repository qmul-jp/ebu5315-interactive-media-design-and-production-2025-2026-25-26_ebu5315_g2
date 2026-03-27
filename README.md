# Circle Geometry Studio

一个面向圆几何学习的前端小项目，采用“学-练-测”路径：
- 学：主页快速理解核心规则
- 练：Game 页面进行图形挑战
- 测：Quiz 页面进行分级检测

## 仓库结构

```text
.
├─ README.md
├─ codes/
│  ├─ index.html
│  ├─ game.html
│  ├─ quiz.html
│  ├─ styles.css
│  └─ app.js
└─ images/
   ├─ logo_m.svg
   ├─ hero_l.svg
   ├─ hero_x.svg
   └─ hero_y.svg
```

## 目录约定

- `codes/`：存放代码文件
- `images/`：存放图片文件

## 图片命名规范

- `名字_m`：所有成员通用图片（如 logo、通用图标）
- `名字_l` / `名字_x` / `名字_y`：三位成员各自负责内容的图片

## 全局变量命名规范

统一使用下划线命名法。

```js
const theme_color = "#0d3273";
const sub_color = "#4471c2";
const highlight_color = "#e8a0bf";
const bg_color = "#ffffff";
const bg_color_night = "#150936";
let is_night = false; // false: 白天, true: 黑夜
```

## 运行方式

直接使用浏览器打开 `codes/index.html` 即可。

## 页面说明

- `codes/index.html`：Homepage，展示规则、入口、联系表单与 AI 导学入口
- `codes/game.html`：Game 页面，进行规则应用型挑战
- `codes/quiz.html`：Quiz 页面，按难度分级自测
