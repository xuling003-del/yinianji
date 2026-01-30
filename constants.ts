
import { Course, Lesson, Question } from './types';
import { QUESTION_BANK } from './questions';

export const COURSES: Course[] = [
  { id: 'main', title: '20天全能冒险', description: '涵盖数学计算、应用、思维与语文表达。', icon: '🚀' }
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
 */
export function generateLesson(day: number, excludeIds: string[] = [], userSeed: number = 0): Lesson {
  // Combine day and userSeed to create a unique but consistent seed for this day/user combo
  // This ensures that different users get different questions for Day 1, but the same user gets consistent behavior on refresh.
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
    // This logic ensures we only repeat if absolutely necessary (e.g. strict depletion of bank)
    if (available.length < count) {
      const remainingNeeded = count - available.length;
      const reused = QUESTION_BANK.filter(q => q.category === cat && excludeIds.includes(q.id));
      available = [...available, ...shuffle(reused, seed).slice(0, remainingNeeded)];
    }

    return shuffle(available, seed).slice(0, count);
  };

  // 每天的固定配比：2基础 + 1应用 + 1思维 + 1语文句子 + 1语文词语
  const questions: Question[] = [
    ...getByCategory('basic', 2),
    ...getByCategory('application', 1),
    ...getByCategory('logic', 1),
    ...getByCategory('sentence', 1),
    ...getByCategory('word', 1)
  ];

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

  // Final shuffle of the selected questions so they appear mixed (not grouped by category)
  return {
    day,
    title: `第 ${day} 天：奇幻探索`,
    icon,
    story,
    questions: shuffle(questions, seed + 999),
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
