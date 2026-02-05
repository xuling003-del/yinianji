
import { Course, Lesson, Question, ParentSettings, QuestionCategory, AchievementCard, DecorationItem } from './types';
import { QUESTION_BANK } from './questions';

export const COURSES: Course[] = [
  { id: 'main', title: '20天全能冒险', description: '涵盖数学计算、应用、思维与语文表达。', icon: '🚀' }
];

export const DEFAULT_SETTINGS: ParentSettings = {
  questionCounts: {
    'basic': 2,
    'application': 1,
    'logic': 1,
    'sentence': 1,
    'word': 1
  },
  shuffleQuestions: true,
  customRewards: [
    { id: 'r1', name: '奖励1元零花钱', probability: 20 },
    { id: 'r2', name: '看动画片20分钟', probability: 30 }
  ]
};

export const STICKERS = [
  { id: 's1', icon: '🦕', name: '小恐龙' },
  { id: 's2', icon: '🦄', name: '独角兽' },
  { id: 's3', icon: '🤖', name: '机器人' },
  { id: 's4', icon: '👽', name: '外星人' },
  { id: 's5', icon: '🐳', name: '喷水鲸' },
  { id: 's6', icon: '🦋', name: '彩蝶' },
  { id: 's7', icon: '🚀', name: '小火箭' },
  { id: 's8', icon: '🎪', name: '马戏团' },
  { id: 's9', icon: '🎨', name: '调色盘' },
  { id: 's10', icon: '🍔', name: '汉堡包' },
];

export const COLLECTION_CARD_COUNT = 10;

export const AVATARS = [
  { id: 'cat', icon: '🐱', cost: 0 },
  { id: 'dog', icon: '🐶', cost: 100 },
  { id: 'lion', icon: '🦁', cost: 300 },
  { id: 'owl', icon: '🦉', cost: 500 },
  { id: 'unicorn', icon: '🦄', cost: 1000 },
];

export const DECORATIONS: DecorationItem[] = [
  // Themes (Backgrounds)
  { id: 'theme_sky', type: 'theme', name: '蓝天岛', icon: '🌤️', cost: 0, styleClass: 'bg-sky-50' },
  { id: 'theme_forest', type: 'theme', name: '森林岛', icon: '🌲', cost: 200, styleClass: 'bg-green-50' },
  { id: 'theme_sunset', type: 'theme', name: '夕阳岛', icon: '🌇', cost: 400, styleClass: 'bg-orange-50' },
  { id: 'theme_dream', type: 'theme', name: '梦幻岛', icon: '🦄', cost: 800, styleClass: 'bg-purple-50' },
  
  // Pets (Floating companions)
  { id: 'pet_bird', type: 'pet', name: '小蓝鸟', icon: '🐦', cost: 0 },
  { id: 'pet_bee', type: 'pet', name: '勤劳蜂', icon: '🐝', cost: 150 },
  { id: 'pet_butterfly', type: 'pet', name: '花蝴蝶', icon: '🦋', cost: 300 },
  { id: 'pet_dragon', type: 'pet', name: '喷火龙', icon: '🐉', cost: 600 },
  { id: 'pet_ufo', type: 'pet', name: '外星船', icon: '🛸', cost: 1000 },

  // Buildings (Fixed structures)
  { id: 'build_tent', type: 'building', name: '小帐篷', icon: '⛺', cost: 0 },
  { id: 'build_house', type: 'building', name: '小木屋', icon: '🏠', cost: 200 },
  { id: 'build_castle', type: 'building', name: '大城堡', icon: '🏰', cost: 500 },
  { id: 'build_ferris', type: 'building', name: '摩天轮', icon: '🎡', cost: 800 },
  { id: 'build_rocket', type: 'building', name: '火箭基', icon: '🚀', cost: 1200 },
];

// ----------------------------------------------------------------------
// 荣誉卡片 (Achievement Cards)
// ----------------------------------------------------------------------

export const ACHIEVEMENT_CARDS: AchievementCard[] = [
  {
    id: 'streak_3',
    title: '坚持之星',
    conditionText: '连续学习3天解锁',
    icon: '🌱',
    description: '坚持是成功的基石',
    message: '奖励给坚持与成长的你',
    colorClass: 'bg-green-100 border-green-300 text-green-700',
    image: 'media/honor/jianchi.png'
  },
  {
    id: 'streak_10',
    title: '胜利勋章',
    conditionText: '连续学习10天解锁',
    icon: '🏆',
    description: '你的毅力令人佩服',
    message: '你不仅聪明，还勤奋，没有什么事情是你办不到的！',
    colorClass: 'bg-amber-100 border-amber-300 text-amber-700',
    image: 'media/honor/shengli.png'
  },
  {
    id: 'perfect_score',
    title: '智慧光环',
    conditionText: '单关卡无错题解锁',
    icon: '✨',
    description: '追求卓越，一丝不苟',
    message: '奖励给细心与智慧的你',
    colorClass: 'bg-indigo-100 border-indigo-300 text-indigo-700',
    image: 'media/honor/zhihui.png'
  },
  {
    id: 'speed_runner',
    title: '闪电侠',
    conditionText: '单关卡1分钟内通关解锁',
    icon: '⚡',
    description: '思维敏捷，快如闪电',
    message: '你像闪电一样迅捷，手握智慧的权杖',
    colorClass: 'bg-sky-100 border-sky-300 text-sky-700',
    image: 'media/honor/shandian.png'
  },
  {
    id: 'perfect_storm',
    title: '完美风暴',
    conditionText: '1分钟内且无错题通关解锁',
    icon: '💎',
    description: '完美与速度的化身',
    message: '速度与准确的完美结合，你是当之无愧的超级探险家！',
    colorClass: 'bg-rose-100 border-rose-300 text-rose-700',
    image: 'media/honor/wanmei.png'
  },
  // New Cards
  {
    id: 'sharpshooter',
    title: '百发百中',
    conditionText: '连续3关无错题',
    icon: '🎯',
    description: '精准与专注的完美展现',
    message: '你的专注力像神射手一样精准，每道题目都轻松命中！',
    colorClass: 'bg-orange-100 border-orange-300 text-orange-700',
    image: 'media/honor/baifa.png' // Fallback to collection card images as placeholders
  },
  {
    id: 'knowledge_expert',
    title: '知识达人',
    conditionText: '累计学习2小时',
    icon: '📚',
    description: '勤奋学习，收获满满',
    message: '两小时的专注学习，你已经积累了满满的智慧！',
    colorClass: 'bg-blue-100 border-blue-300 text-blue-700',
    image: 'media/honor/zhishi.png'
  },
  {
    id: 'logic_master',
    title: '思维大师',
    conditionText: '累计答对100题',
    icon: '🧠',
    description: '智慧的积淀，思维的升华',
    message: '100道题的正确解答，证明了你强大的逻辑思维能力！',
    colorClass: 'bg-purple-100 border-purple-300 text-purple-700',
    image: 'media/honor/siwei.png'
  },
  {
    id: 'collection_king',
    title: '七彩收集家',
    conditionText: '收集5张不同珍藏卡',
    icon: '🌈',
    description: '探索的足迹，珍贵的收藏',
    message: '你的背包里装满了奇珍异宝，真是个了不起的收藏家！',
    colorClass: 'bg-pink-100 border-pink-300 text-pink-700',
    image: 'media/honor/qicai.png'
  }
];

// Helper to seed random
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates a lesson for a specific day while ensuring no questions from excludeIds are used.
 * UPDATED: Now requires `questionBank` to be passed in.
 */
export function generateLesson(
  questionBank: Question[],
  day: number, 
  excludeIds: string[] = [], 
  userSeed: number = 0,
  settings: ParentSettings = DEFAULT_SETTINGS
): Lesson {
  // Combine day and userSeed to create a unique but consistent seed for this day/user combo
  const seed = (day * 123) + userSeed;
  
  const shuffleQuestions = (arr: any[], customSeed: number) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(customSeed + i) * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const getByCategory = (cat: string, count: number) => {
    let available = questionBank.filter(q => q.category === cat && !excludeIds.includes(q.id));
    
    // If we run out of questions in a category, reuse older ones but prioritize unused
    if (available.length < count) {
      const remainingNeeded = count - available.length;
      const reused = questionBank.filter(q => q.category === cat && excludeIds.includes(q.id));
      // Concatenate available with reused items to fill the need
      available = [...available, ...shuffleQuestions(reused, seed).slice(0, remainingNeeded)];
    }
    return shuffleQuestions(available, seed).slice(0, count);
  };

  let questions: Question[] = [];
  (Object.keys(settings.questionCounts) as QuestionCategory[]).forEach(cat => {
    const count = settings.questionCounts[cat];
    if (count > 0) {
      questions = [...questions, ...getByCategory(cat, count)];
    }
  });

  const icons = ['🌴', '🏹', '💎', '🏰', '🗺️', '🦜', '⛺', '🛶'];
  const icon = icons[day % icons.length];

  const stories = [
    "勇敢的小探险家，今天我们要深入神秘的丛林！",
    "传闻这片海域藏着失落的宝藏，让我们出发吧！",
    "穿越这道彩虹之桥，就能到达云端的智慧之塔。",
    "沙漠深处的金字塔里，刻着古老的算术咒语。",
    "在寒冷的冰雪城堡，只有聪明的头脑能点燃篝火。",
    "传说中的翡翠森林里，住着会出谜题的小精灵。",
    "深海里的亚特兰蒂斯，石碑上记录着神奇的等式。",
    "远古的火山岛上，每一块红石都蕴含着逻辑的力量。"
  ];
  const story = stories[day % stories.length];

  const finalQuestions = settings.shuffleQuestions ? shuffleQuestions(questions, seed + 999) : questions;

  return {
    day,
    title: `第 ${day} 天：奇幻探索`,
    icon,
    story,
    questions: finalQuestions,
    points: 100 + day * 5
  };
}
