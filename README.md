# 奇幻学习岛 - 低年级互动课堂 🏝️

一个专为小学低年级学生设计的20天互动学习平台，采用游戏化学习方式，让学习变得有趣且富有挑战性。

## ✨ 项目特色

- 🎮 **游戏化学习** - 通过岛屿探索、收集卡牌、解锁成就的方式激发学习兴趣
- 📚 **多学科融合** - 涵盖数学计算、应用题、逻辑推理、语文识字等多个领域
- 🧠 **智能题库** - 自适应难度，错题自动复习，巩固薄弱知识点
- 🏆 **成就系统** - 多种成就徽章，记录学习里程碑
- 🎨 **个性化装扮** - 可自定义头像、主题、宠物和建筑
- 📱 **多端支持** - Web PWA + Android App，随时随地学习

## 📦 技术栈

### 前端框架
- **React 19** - 用户界面
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS 4** - 样式框架

### 移动端
- **Capacitor 6** - 跨平台移动应用
- **Service Worker** - 离线缓存支持

### 数据存储
- **LocalStorage** - 用户进度保存
- **JSON** - 题库管理

## 🗂️ 项目结构

```
qihuan/
├── android/                    # Android 项目
│   └── app/src/main/
│       ├── AndroidManifest.xml   # 应用配置
│       ├── res/                # 资源文件（图标、布局等）
│       └── java/               # Java 源代码
├── components/                 # React 组件
│   ├── Header.tsx             # 顶部导航
│   ├── IslandMap.tsx          # 岛屿地图
│   ├── LessonViewer.tsx        # 课程学习
│   ├── StoreView.tsx          # 商店
│   └── ProfileView.tsx        # 个人中心
├── public/                    # 静态资源
│   ├── data/                  # 题库数据
│   │   ├── manifest.json       # 题库清单
│   │   ├── math/             # 数学题库
│   │   │   ├── basic.json     # 基础计算 (45题)
│   │   │   ├── logic.json     # 逻辑思维 (70题)
│   │   │   ├── emoji.json     # 表情符号数学 (50题)
│   │   │   └── application.json # 应用题
│   │   └── chinese/          # 语文题库
│   │       ├── word.json      # 生字词
│   │       ├── sentence.json  # 句子
│   │       ├── punctuation.json # 标点符号
│   │       └── antonym.json   # 反义词
│   ├── media/                # 图片资源
│   └── sw.js               # Service Worker
├── hooks/                    # 自定义 Hooks
│   └── useGameState.ts      # 游戏状态管理
├── utils/                    # 工具函数
│   └── helpers.ts          # 辅助函数
├── App.tsx                  # 主应用
├── constants.ts             # 常量配置
├── types.ts                # TypeScript 类型定义
├── package.json
├── vite.config.ts
├── capacitor.config.json     # Capacitor 配置
└── tsconfig.json
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 构建
```bash
npm run build
```

## 📱 Android 打包

详细打包指南请查看 [ANDROID_BUILD.md](./ANDROID_BUILD.md)

### 快速打包命令
```bash
# 构建并打开 Android Studio
npm run android

# 仅构建同步
npm run android:build
```

## 🎓 题库结构

### 数学 (Math)
| 类别 | 文件 | 题目数 | 说明 |
|------|------|--------|------|
| 基础计算 | `basic.json` | 45 | 加减法、乘法入门 |
| 逻辑思维 | `logic.json` | 70 | 找规律、推理题 |
| 表情符号 | `emoji.json` | 50 | 用表情符号表示数学题 |
| 应用题 | `application.json` | - | 实际应用场景 |

### 语文 (Chinese)
| 类别 | 文件 | 说明 |
|------|------|------|
| 生字词 | `word.json` | 汉字识记 |
| 句子 | `sentence.json` | 句子理解 |
| 标点符号 | `punctuation.json` | 标点用法 |
| 反义词 | `antonym.json` | 词汇扩展 |

## 🎮 核心功能

### 游戏化元素
- **岛屿地图** - 20个关卡对应20个岛屿
- **星星系统** - 完成关卡获得星星
- **商店系统** - 使用星星购买装扮
- **成就徽章** - 9种可解锁成就
- **错题复习** - 智能错题队列，间隔重复学习

### 自适应难度
- 随天数增加难度提升 (Lv1 → Lv5)
- 根据用户水平动态调整
- 错题优先复习机制

### 家长设置
- 自定义每类题目数量
- 开启/关闭题目乱序
- 自定义奖励机制

## 🏆 成就系统

| 成就 | 解锁条件 | 徽章 |
|------|----------|------|
| 坚持之星 | 连续学习3天 | 🌟 |
| 胜利勋章 | 连续学习10天 | 🏆 |
| 智慧光环 | 单关卡无错题 | ✨ |
| 闪电侠 | 1分钟内通关 | ⚡ |
| 完美风暴 | 1分钟内且无错题 | 🌪️ |
| 百发百中 | 连续3关无错题 | 🎯 |
| 知识达人 | 累计学习2小时 | 📚 |
| 思维大师 | 累计答对100题 | 🧠 |
| 七彩收藏家 | 收集5张珍藏卡 | 🌈 |

## 🎨 商店系统

### 装扮类型
- **主题** - 改变岛屿背景
- **宠物** - 岛上陪伴的小动物
- **建筑** - 岛上装饰建筑

### 收集卡牌
- 完成关卡随机获得
- 收集不同卡牌解锁成就

## 🔧 配置说明

### Capacitor 配置 (`capacitor.config.json`)
```json
{
  "appId": "com.studyisland.app",
  "appName": "奇幻学习岛",
  "webDir": "dist"
}
```

### 应用图标
修改应用图标位置：
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `public/media/icon/icon-192x192.png`
- `public/media/icon/icon-512x512.png`

## 📝 开发指南

### 添加新题目
在对应的 `public/data/` 目录下编辑 JSON 文件：

```json
{
  "id": "题目ID",
  "category": "分类",
  "type": "multiple-choice",
  "difficulty": 1-5,
  "text": "题目文本",
  "options": ["选项A", "选项B", "选项C"],
  "answer": "正确答案",
  "explanation": "解析说明"
}
```

### 更新题库清单
修改 `public/data/manifest.json` 添加新模块。

## 📱 发布应用

### PWA 发布
1. 执行 `npm run build`
2. 将 `dist` 目录部署到静态服务器
3. 确保 Service Worker 正常工作

### Android 发布
1. 按打包指南构建 APK
2. 生成签名密钥
3. 上传到应用市场（华为、小米、OPPO等）

详细发布流程见 [ANDROID_BUILD.md](./ANDROID_BUILD.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**🏝️ 奇幻学习岛 - 让学习成为一场冒险！**
