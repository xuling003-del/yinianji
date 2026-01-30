
import { Question } from './types';

export const QUESTION_BANK: Question[] = [
  // --- 数学基础题 (category: basic) ---
  { id: 'm-b-1', category: 'basic', type: 'multiple-choice', text: '列竖式计算：368 + 235 =', options: ['603', '593', '613'], answer: '603', explanation: '个位8+5=13进1，十位6+3+1=10进1，百位3+2+1=6。' },
  { id: 'm-b-2', category: 'basic', type: 'multiple-choice', text: '计算：9 + 4 + 6 + 11 =', options: ['30', '29', '31'], answer: '30', explanation: '巧算：(9+11) + (4+6) = 20 + 10 = 30。' },
  { id: 'm-b-3', category: 'basic', type: 'multiple-choice', text: '计算：37 - 8 - 12 =', options: ['17', '19', '15'], answer: '17', explanation: '巧算：37 - (8+12) = 37 - 20 = 17。' },
  { id: 'm-b-4', category: 'basic', type: 'multiple-choice', text: '在方框中填数使算式成立：3□ + □8 = 72', options: ['34+38', '33+39', '35+37'], answer: '34+38', explanation: '个位4+8=12进1，十位3+3+1=7。' },
  { id: 'm-b-5', category: 'basic', type: 'multiple-choice', text: '在（ ）中填入符号使等式成立：8 ( ) 3 ( ) 5 = 6', options: ['- , +', '+ , -', '- , -'], answer: '+ , -', explanation: '8 + 3 = 11, 11 - 5 = 6。所以应填 + 和 -。' },
  { id: 'm-b-6', category: 'basic', type: 'multiple-choice', text: '用2, 5, 7, 10填空使等式成立：( ) + ( ) - ( ) = ( )', options: ['2 + 10 - 5 = 7', '2 + 5 - 7 = 0', '10 + 7 - 5 = 12'], answer: '2 + 10 - 5 = 7', explanation: '2+10=12, 12-5=7。四个数都用到了！' },
  { id: 'm-b-7', category: 'basic', type: 'multiple-choice', text: '哪些是奇数？ ①17 ②24 ③39 ④50 ⑤83', options: ['①③⑤', '①②③', '③④⑤'], answer: '①③⑤', explanation: '不能被2整除的数是奇数，看个位是1,3,5,7,9。' },
  { id: 'm-b-8', category: 'basic', type: 'multiple-choice', text: '1个菠萝=4个苹果，1个苹果=3个橘子，1个菠萝等于几个橘子？', options: ['12个', '7个', '8个'], answer: '12个', explanation: '4个苹果就是4个3，4 × 3 = 12。' },
  { id: 'm-b-9', category: 'basic', type: 'multiple-choice', text: '小明7岁，爸爸35岁，5年后爸爸比小明大几岁？', options: ['28岁', '33岁', '40岁'], answer: '28岁', explanation: '年龄差永远不变：35 - 7 = 28。' },
  { id: 'm-b-10', category: 'basic', type: 'multiple-choice', text: '一根绳子长12米，对折以后再对折，每折长多少米？', options: ['3米', '6米', '4米'], answer: '3米', explanation: '对折一次是6米，再对折就是3米。' },
  // 新增基础题
  { id: 'm-b-11', category: 'basic', type: 'multiple-choice', text: '3元6角 = （ ）角', options: ['36', '306', '63'], answer: '36', explanation: '1元=10角，3元=30角，30+6=36角。' },
  { id: 'm-b-12', category: 'basic', type: 'multiple-choice', text: '钟面上，分针指向6，时针在3和4之间，现在是（ ）', options: ['3时半', '3时6分', '4时半'], answer: '3时半', explanation: '分针指6表示30分（半），时针走过3不到4，所以是3时30分（3时半）。' },
  { id: 'm-b-13', category: 'basic', type: 'multiple-choice', text: '把 37、89、56、23 按从大到小的顺序排列，排在第二位的是：', options: ['56', '37', '89'], answer: '56', explanation: '89 > 56 > 37 > 23。第二大的是56。' },
  { id: 'm-b-14', category: 'basic', type: 'multiple-choice', text: '50角 = （ ）元', options: ['5', '50', '500'], answer: '5', explanation: '10角=1元，50角里面有5个10，所以是5元。' },
  { id: 'm-b-15', category: 'basic', type: 'multiple-choice', text: '找规律填数：3、6、9、（ ）、15', options: ['12', '11', '13'], answer: '12', explanation: '每次加3。9+3=12。' },

  // --- 数学应用题 (category: application) ---
  { id: 'm-a-1', category: 'application', type: 'multiple-choice', text: '超市有18箱牛奶，卖出9箱又进货12箱，现在有几箱？', options: ['21箱', '15箱', '30箱'], answer: '21箱', explanation: '18 - 9 = 9, 9 + 12 = 21。' },
  { id: 'm-a-2', category: 'application', type: 'multiple-choice', text: '排队时，小红前面有6人，后面有8人，这一队共几人？', options: ['15人', '14人', '13人'], answer: '15人', explanation: '前面6人 + 小红1人 + 后面8人 = 15人。' },
  { id: 'm-a-3', category: 'application', type: 'multiple-choice', text: '妈妈买25个苹果，剩7个，分给家人几个？', options: ['18个', '32个', '12个'], answer: '18个', explanation: '25 - 7 = 18。' },
  { id: 'm-a-4', category: 'application', type: 'multiple-choice', text: '篮子A有16个蛋，篮子B有10个，怎样移动能相等？', options: ['A给B 3个', 'A给B 6个', 'B给A 3个'], answer: 'A给B 3个', explanation: '总数26，每篮应13个。16-13=3。' },
  { id: 'm-a-5', category: 'application', type: 'multiple-choice', text: '木头锯成4段要锯几次？每锯一次3分钟共几分钟？', options: ['3次，9分钟', '4次，12分钟', '3次，6分钟'], answer: '3次，9分钟', explanation: '锯4段只需锯3次，3 × 3 = 9。' },
  { id: 'm-a-6', category: 'application', type: 'multiple-choice', text: '体育室有45只球，第一次借走9只，第二次借走10只，体育室的球比原来少了几只？', options: ['19只', '26只', '45只'], answer: '19只', explanation: '问“少了”多少，就是问“借走”了多少。9 + 10 = 19只。' },
  { id: 'm-a-7', category: 'application', type: 'multiple-choice', text: '书70页，第一天看18页，第二天看10页，第三天从第几页看起？', options: ['28页', '29页', '30页'], answer: '29页', explanation: '前两天共看了 18 + 10 = 28页。所以第三天从第 29 页开始看。' },
  { id: 'm-a-8', category: 'application', type: 'multiple-choice', text: '妈妈买了一些苹果，爸爸吃2个，爷爷、奶奶和我各吃1个，正好吃了一半。妈妈买了几个？', options: ['5个', '10个', '8个'], answer: '10个', explanation: '吃掉的数量是 2+1+1+1=5个，这正好是一半，所以原来有 5+5=10个。' },
  { id: 'm-a-9', category: 'application', type: 'multiple-choice', text: '家里有2只白兔，每只白兔生了3只小兔，现在一共有几只兔子？', options: ['6只', '8只', '5只'], answer: '8只', explanation: '大兔子2只，小兔子 2 × 3 = 6只。总共 2 + 6 = 8只。' },
  // 新增应用题
  { id: 'm-a-10', category: 'application', type: 'multiple-choice', text: '排队体检，从前面数乐乐是第12个，从后面数乐乐是第9个，这一队一共有多少人？', options: ['20人', '21人', '12人'], answer: '20人', explanation: '乐乐被数了两次，所以要减1。12 + 9 - 1 = 20人。' },
  { id: 'm-a-11', category: 'application', type: 'multiple-choice', text: '小明带50元买文具，买书包花36元，买文具盒花8元，还剩多少钱？', options: ['6元', '14元', '42元'], answer: '6元', explanation: '50 - 36 - 8 = 6元。或者 50 - (36+8) = 6元。' },
  { id: 'm-a-12', category: 'application', type: 'multiple-choice', text: '一根绳子剪3次，能剪成几段？', options: ['3段', '4段', '2段'], answer: '4段', explanation: '段数总是比剪的次数多1。3 + 1 = 4段。' },

  // --- 数学思维题 (category: logic) ---
  { id: 'm-l-1', category: 'logic', type: 'multiple-choice', text: '找出与其他项不同的一组数：', options: ['2, 4, 6', '10, 12, 14', '5, 10, 15'], answer: '5, 10, 15', explanation: '前两组都是公差为2的偶数序列，第三组公差为5。' },
  { id: 'm-l-2', category: 'logic', type: 'multiple-choice', text: '找规律：2, 5, 9, 14, ( ), 27', options: ['20', '19', '21'], answer: '20', explanation: '加3，加4，加5，接下来加6：14+6=20。' },
  { id: 'm-l-3', category: 'logic', type: 'multiple-choice', text: '灯亮着，拉7下开关，灯是亮的还是暗的？', options: ['暗的', '亮的', '坏了'], answer: '暗的', explanation: '单数下是相反状态。1下暗，2下亮...7下暗。' },
  { id: 'm-l-4', category: 'logic', type: 'multiple-choice', text: '口袋有红白球各4个，至少摸几个保证有一双同色的？', options: ['3个', '2个', '5个'], answer: '3个', explanation: '最坏情况前两个不同色，第三个一定能配对。' },
  { id: 'm-l-5', category: 'logic', type: 'multiple-choice', text: '小猴爬6米高的大树，每次爬上4米又滑下2米，第几次才能爬上树顶？', options: ['2次', '3次', '4次'], answer: '2次', explanation: '第一次爬4米滑2米（实际高2米），第二次从2米处再爬4米，直接到顶（2+4=6米），不需要再滑下来了。' },
  { id: 'm-l-6', category: 'logic', type: 'multiple-choice', text: '灯不亮，淘气的小狗拉了10次开关，这时候灯亮着吗？', options: ['不亮', '亮', '坏了'], answer: '不亮', explanation: '开关拉2次恢复原状（偶数次不改状态，奇数次改变）。10是偶数，所以还是不亮。' },
  { id: 'm-l-7', category: 'logic', type: 'multiple-choice', text: '一根木头锯成5段，要锯几次？', options: ['4次', '5次', '6次'], answer: '4次', explanation: '锯的次数总是比段数少1。5 - 1 = 4次。' },
  { id: 'm-l-8', category: 'logic', type: 'multiple-choice', text: '把7根短绳连成一根长绳，要打几个结？', options: ['6个', '7个', '8个'], answer: '6个', explanation: '连接处的结总是比绳子数量少1。7 - 1 = 6个。' },
  { id: 'm-l-9', category: 'logic', type: 'multiple-choice', text: '1到50的号码中，数字“1”一共出现了几次？', options: ['15次', '14次', '5次'], answer: '15次', explanation: '个位是1的有5个(1,11,21,31,41)；十位是1的有10个(10-19)。5 + 10 = 15次。' },
  { id: 'm-l-10', category: 'logic', type: 'multiple-choice', text: '鸭妈妈数孩子，从后向前数自己是第6，从前向后数自己是第7，一共有几个孩子？', options: ['11个', '12个', '13个'], answer: '11个', explanation: '队伍总数 = 6 + 7 - 1(鸭妈妈) = 12只。题目问有几个“孩子”，所以 12 - 1 = 11个。' },
  { id: 'm-l-11', category: 'logic', type: 'multiple-choice', text: '停电点燃12支蜡烛，风吹灭了9支。第二天早上还剩几支？', options: ['9支', '3支', '0支'], answer: '9支', explanation: '这是一个脑筋急转弯。没有被吹灭的蜡烛都烧完了，只有被吹灭的9支留了下来。' },
  { id: 'm-l-12', category: 'logic', type: 'multiple-choice', text: '10个小朋友玩老鹰抓小鸡（1人扮老鹰，1人扮母鸡），捉住了5只小鸡，还有几只没被捉住？', options: ['3只', '4只', '5只'], answer: '3只', explanation: '小鸡总数 = 10 - 1(鹰) - 1(母) = 8只。没被捉 = 8 - 5 = 3只。' },
  { id: 'm-l-13', category: 'logic', type: 'multiple-choice', text: '小明一个人走进教室，看见有7个同学在教室，请问现在教室有几个人？', options: ['8个', '7个', '6个'], answer: '8个', explanation: '原来的7个同学 + 走进来的小明 = 8个人。' },
  { id: 'm-l-14', category: 'logic', type: 'multiple-choice', text: '3个男同学与3个女同学进行打球比赛，如果每个男同学都要与每个女同学比赛1次，一共需要比赛几次？', options: ['9次', '6次', '3次'], answer: '9次', explanation: '3个男生，每个人都要打3场，3 × 3 = 9次。' },
  { id: 'm-l-15', category: 'logic', type: 'multiple-choice', text: '小力今年6岁，奶奶说等小力9岁的时候奶奶就55岁了。奶奶今年几岁？', options: ['52岁', '55岁', '49岁'], answer: '52岁', explanation: '小力长了 9 - 6 = 3岁，所以奶奶今年是 55 - 3 = 52岁。' },
  { id: 'm-l-16', category: 'logic', type: 'multiple-choice', text: '找规律：13, 31, 24, 42, 35, 53, ( ), ( )', options: ['46, 64', '45, 54', '46, 65'], answer: '46, 64', explanation: '规律是数字倒过来。接下来应该是46和64。' },
  { id: 'm-l-17', category: 'logic', type: 'multiple-choice', text: '8个男生排成一排，每两个男生之间有一个女生，这一排共有几个学生？', options: ['15个', '16个', '14个'], answer: '15个', explanation: '8个男生之间有7个空隙，所以有7个女生。8 + 7 = 15个。' },
  { id: 'm-l-18', category: 'logic', type: 'multiple-choice', text: '小红用同样的钱可以买3只蛋糕或者4只面包，哪个贵？', options: ['蛋糕', '面包', '一样贵'], answer: '蛋糕', explanation: '同样的钱，买的数量越少，说明单价越贵。' },
  { id: 'm-l-19', category: 'logic', type: 'multiple-choice', text: '口袋有黑袜子和白袜子各三双，杂乱放在一起，至少摸几只才能保证配成一双颜色相同的？', options: ['3只', '2只', '4只'], answer: '3只', explanation: '颜色只有黑和白2种。如果你摸了2只正好一黑一白，第3只不管是什么颜色，都能和前面的一只配对。' },
  { id: 'm-l-20', category: 'logic', type: 'multiple-choice', text: '一本书，小红第一天读1页，以后每天都比前一天多读1页，读到第4天，一共读了几页？', options: ['10页', '4页', '8页'], answer: '10页', explanation: '1 + 2 + 3 + 4 = 10页。' },
  // 新增思维题
  { id: 'm-l-21', category: 'logic', type: 'multiple-choice', text: '一根彩带对折3次后长2厘米，这根彩带原来长多少厘米？', options: ['16厘米', '8厘米', '6厘米'], answer: '16厘米', explanation: '对折1次2段，2次4段，3次8段。8 × 2 = 16厘米。' },
  { id: 'm-l-22', category: 'logic', type: 'multiple-choice', text: '有10块糖，分给5个好朋友，每人2块，小明自己还剩几块？', options: ['0块', '5块', '2块'], answer: '0块', explanation: '5个人 × 2块 = 10块。10 - 10 = 0块，分完了。' },
  { id: 'm-l-23', category: 'logic', type: 'multiple-choice', text: '找规律：1、2、4、7、11、（ ）', options: ['16', '15', '14'], answer: '16', explanation: '每次增加的数分别是1、2、3、4。所以下一个增加5。11 + 5 = 16。' },

  // --- 语文连词成句 (category: sentence) ---
  { id: 'c-s-1', category: 'sentence', type: 'unscramble', text: '我们 / 公园 / 周末 / 常常 / 去 / 玩', answer: '我们周末常常去公园玩', explanation: '时间（周末）通常放在主语后或句首。' },
  { id: 'c-s-2', category: 'sentence', type: 'unscramble', text: '美丽的 / 春天 / 花儿 / 开了 / 公园里', answer: '春天公园里美丽的花儿开了', explanation: '描述“美丽的”修饰花儿。' },
  { id: 'c-s-3', category: 'sentence', type: 'unscramble', text: '老师 / 我们 / 关心 / 非常 / 的 / 成长', answer: '老师非常关心我们的成长', explanation: '关心的是成长。' },
  { id: 'c-s-4', category: 'sentence', type: 'unscramble', text: '小明 / 是 / 爱学习 / 的 / 好孩子 / 一个', answer: '小明是一个爱学习的好孩子', explanation: '“一个”修饰好孩子。' },
  { id: 'c-s-5', category: 'sentence', type: 'unscramble', text: '在 / 小鸟 / 枝头 / 高兴地 / 唱歌', answer: '小鸟在枝头高兴地唱歌', explanation: '主语小鸟在做什么。' },
  { id: 'c-s-6', category: 'sentence', type: 'unscramble', text: '妈妈 / 买了 / 苹果 / 许多 / 新鲜的', answer: '妈妈买了许多新鲜的苹果', explanation: '正确语序是：主语 + 谓语 + 数量形容词修饰的宾语。' },
  { id: 'c-s-7', category: 'sentence', type: 'unscramble', text: '同学们 / 操场上 / 跑步 / 正在 / 快乐地', answer: '同学们正在操场上快乐地跑步', explanation: '动作发生的状态描述。' },
  { id: 'c-s-8', category: 'sentence', type: 'unscramble', text: '这本书 / 我 / 送给 / 是 / 爸爸 / 的', answer: '这本书是爸爸送给我的', explanation: '物品所有权归属描述。' },
  { id: 'c-s-9', category: 'sentence', type: 'unscramble', text: '为什么 / 你 / 今天 / 没来 / 上学 / 呢', answer: '你今天为什么没来上学呢', explanation: '疑问句的正常语序。' },
  { id: 'c-s-10', category: 'sentence', type: 'unscramble', text: '香山的 / 红叶 / 看过 / 你 / 吗', answer: '你看过香山的红叶吗', explanation: '简单疑问句。' },
  // 新增句子题
  { id: 'c-s-11', category: 'sentence', type: 'unscramble', text: '小鸟 / 天空中 / 自由地 / 在 / 飞翔', answer: '小鸟在天空中自由地飞翔', explanation: '主语+地点+状态+谓语。' },
  { id: 'c-s-12', category: 'sentence', type: 'unscramble', text: '多么 / 春天 / 美丽 / 啊', answer: '春天多么美丽啊', explanation: '感叹句语序。' },
  { id: 'c-s-13', category: 'sentence', type: 'unscramble', text: '你 / 去过 / 北京 / 吗', answer: '你去过北京吗', explanation: '疑问句语序。' },
  { id: 'c-s-14', category: 'sentence', type: 'unscramble', text: '妈妈 / 我 / 一件 / 买了 / 漂亮的 / 裙子', answer: '妈妈给我买了一件漂亮的裙子', explanation: '双宾语结构：给谁买什么。' },

  // --- 语文选词填空 (category: word) ---
  { id: 'c-w-1', category: 'word', type: 'fill-in-the-blank', text: '妈妈在（ ）厂上班。', options: ['工', '公', '园', '圆', '元'], answer: '工', explanation: '“工厂”指的是生产产品的地方，用“工”。' },
  { id: 'c-w-2', category: 'word', type: 'fill-in-the-blank', text: '周末我们去（ ）里玩。', options: ['工', '公', '园', '圆', '元'], answer: '园', explanation: '“园里”通常指花园或公园内部，这里指去玩的地方。' },
  { id: 'c-w-3', category: 'word', type: 'fill-in-the-blank', text: '这个皮球是（ ）的。', options: ['工', '公', '园', '圆', '元'], answer: '圆', explanation: '“圆”是形状，皮球是圆形的。' },
  { id: 'c-w-4', category: 'word', type: 'fill-in-the-blank', text: '这枝笔的价格是三（ ）钱。', options: ['工', '公', '园', '圆', '元'], answer: '元', explanation: '“元”是人民币的单位。' },
  { id: 'c-w-5', category: 'word', type: 'fill-in-the-blank', text: '我（ ）家门口等你。', options: ['在', '再', '有', '又'], answer: '在', explanation: '表示处于某个位置，用“在”。' },
  { id: 'c-w-6', category: 'word', type: 'fill-in-the-blank', text: '明天我们（ ）去公园玩。', options: ['在', '再', '有', '又'], answer: '再', explanation: '表示将来的重复或继续，用“再”。' },
  // 新增选词填空
  { id: 'c-w-7', category: 'word', type: 'fill-in-the-blank', text: '我（ ）家里写作业。', options: ['在', '再', '做', '作'], answer: '在', explanation: '表示地点用“在”。' },
  { id: 'c-w-8', category: 'word', type: 'fill-in-the-blank', text: '请你（ ）这道题。', options: ['在', '再', '做', '作'], answer: '做', explanation: '表示从事某种活动，用“做”。' },
  { id: 'c-w-9', category: 'word', type: 'fill-in-the-blank', text: '这是我的（ ）业本。', options: ['在', '再', '做', '作'], answer: '作', explanation: '“作业”是名词，固定搭配用“作”。' },
  { id: 'c-w-10', category: 'word', type: 'fill-in-the-blank', text: '草地上（ ）来了几只小鸟。', options: ['在', '再', '有', '又'], answer: '又', explanation: '表示动作的重复或追加，用“又”。' }
];
