
import { Course, Lesson, Question, ParentSettings, QuestionCategory, AchievementCard } from './types';
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
  shuffleQuestions: true
};

export const ACHIEVEMENT_CARDS: AchievementCard[] = [
  {
    id: 'streak_3',
    title: '坚持之星',
    conditionText: '连续学习3天解锁',
    icon: '🌱',
    message: '奖励给坚持与成长的你',
    colorClass: 'bg-green-100 border-green-300 text-green-700'
  },
  {
    id: 'streak_10',
    title: '胜利勋章',
    conditionText: '连续学习10天解锁',
    icon: '🏆',
    message: '你不仅聪明，还勤奋，没有什么事情是你办不到的！',
    colorClass: 'bg-amber-100 border-amber-300 text-amber-700'
  },
  {
    id: 'perfect_score',
    title: '智慧光环',
    conditionText: '单关卡无错题解锁',
    icon: '✨',
    message: '奖励给细心与智慧的你',
    colorClass: 'bg-indigo-100 border-indigo-300 text-indigo-700'
  },
  {
    id: 'speed_runner',
    title: '闪电侠',
    conditionText: '单关卡1分钟内通关解锁',
    icon: '⚡',
    message: '你像闪电一样迅捷，手握智慧的权杖',
    colorClass: 'bg-sky-100 border-sky-300 text-sky-700'
  },
  {
    id: 'perfect_storm',
    title: '完美风暴',
    conditionText: '1分钟内且无错题通关解锁',
    icon: '💎',
    message: '速度与准确的完美结合，你是当之无愧的超级探险家！',
    colorClass: 'bg-rose-100 border-rose-300 text-rose-700'
  }
];

// 伪随机生成器，根据 seed 确保生成结果的可复现性
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates a lesson for a specific day while ensuring no questions from excludeIds are used.
 * @param day The day number
 * @param excludeIds List of question IDs that have already been used
 * @param userSeed User specific seed to randomize the question order per user
 * @param settings Parent settings for question counts and ordering
 */
export function generateLesson(
  day: number, 
  excludeIds: string[] = [], 
  userSeed: number = 0,
  settings: ParentSettings = DEFAULT_SETTINGS
): Lesson {
  // Combine day and userSeed to create a unique but consistent seed for this day/user combo
  const seed = (day * 123) + userSeed;
  
  const shuffle = (arr: any[], customSeed: number) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(customSeed + i) * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const getByCategory = (cat: string, count: number) => {
    // Filter out already used questions
    let available = QUESTION_BANK.filter(q => q.category === cat && !excludeIds.includes(q.id));
    
    // Fallback: If we run out of questions in a category, reuse older ones but prioritize unused
    if (available.length < count) {
      const remainingNeeded = count - available.length;
      const reused = QUESTION_BANK.filter(q => q.category === cat && excludeIds.includes(q.id));
      available = [...available, ...shuffle(reused, seed).slice(0, remainingNeeded)];
    }

    return shuffle(available, seed).slice(0, count);
  };

  // 根据设置获取题目
  let questions: Question[] = [];
  
  // 遍历配置中的数量
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

  // Apply shuffling based on settings
  const finalQuestions = settings.shuffleQuestions ? shuffle(questions, seed + 999) : questions;

  return {
    day,
    title: `第 ${day} 天：奇幻探索`,
    icon,
    story,
    questions: finalQuestions,
    points: 100 + day * 5
  };
}

export const AVATARS = [
  { id: 'cat', icon: '🐱', cost: 0 },
  { id: 'dog', icon: '🐶', cost: 100 },
  { id: 'lion', icon: '🦁', cost: 300 },
  { id: 'owl', icon: '🦉', cost: 500 },
  { id: 'unicorn', icon: '🦄', cost: 1000 },
];
