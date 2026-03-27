# Interactive Math-Learning Website
**Subject:** Circle-related geometry in mathematics (GCSE level / Equivalent to last year in middle school and first year in high school in China).

## 1. 结构概述 (Repository Structure)
- `README.md`
- `codes/`：用于储存网页代码。
  - `index.html` (Homepage): 主页
  - `game.html` (Game): 游戏页面
  - `quiz.html` (Quiz): 测试页面
- `images/`: 用于储存图片。
- `doc/`: 用于存放开发文档。

## 2. 命名规范 (Naming Conventions)
### 2.1 图片命名
- `[name]_m`: 为所有人都公用的公共图片（如项目 logo 等）。
- `[name]_l`, `[name]_x`, `[name]_y`: 为三位团队成员独自添加使用的图片尾缀。

### 2.2 变量命名规范
- **全局使用下划线命名法 (Snake Case)**。
- 核心状态变量：
  - `is_night` (Boolean): 黑夜白天双模式控制，`false` 为白天，`true` 为黑夜。
  - `is_zh` (Boolean): 中文英文双语控制开关。

## 3. 页面详细需求 (Page Requirements)

### 3.1 Homepage (主页)
- **风格**: Minimalism & informative (极简且信息丰富)。
- **核心模块**:
  1. **Video/Anime/Slide show**: 讲解或展示主要的圆定理与规则 (Explain main circle rules)。
  2. **USP (Unique Selling Point)**: 宣传说明本网站的独特卖点和优势。
  3. **AI Greeting (or Chatbot)**: 引入 AI 打招呼或提供 AI 对话交互入口。
  4. **Contact Us**: “联系我们”的表单（作为主页的一个模块或通过 AI Chatbot 提供入口）。
  5. **盈利模块**: 广告横幅 (Ads banner) 或其他盈利方式的占位展示。

### 3.2 Game (游戏互动页)
- **风格与机制**: 高度交互性的图形化游戏 (Highly interactive and graphic games)。
- **目标**: 通过游戏演示数学概念或设立挑战 (Demonstrate concept or give a challenge)。
- **层级**: 这里可以包含子页面，但不是必需项。
- **AI 要素**: 可选 (Optional)。

### 3.3 Quiz (测验挑战页)
- **类型**: 模拟测试 (Mock test)。
- **机制**:
  1. **分级测试 (Level-based)**: 难度层级递进。
  2. **互动反馈 (Interactive feedback)**: 提交答案后应给予有效反馈。
  3. **题库系统**: 问题从题库(Question bank)中提取，建议采用分支。
  4. **AI 运用**: AI 可用于平滑增加关卡难度和/或避免问题的频繁重复出现。
