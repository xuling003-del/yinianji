
import React, { useState } from 'react';
import { UserState, ParentSettings, DailyStats, QuestionCategory, CustomReward } from '../types';
import { DEFAULT_SETTINGS, AVATARS } from '../constants';
import { playClick, playUnlock } from '../sound';

export const ProfileView: React.FC<{ user: UserState; setUser: (u: UserState) => void; onClose: () => void }> = ({ user, setUser, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);
  const [showParentSettings, setShowParentSettings] = useState(false);
  const [pin, setPin] = useState('');
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [tempSettings, setTempSettings] = useState<ParentSettings>(user.parentSettings || DEFAULT_SETTINGS);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardProb, setNewRewardProb] = useState(10);

  const handleSaveName = () => {
    if (nameVal.trim()) {
      setUser({ ...user, name: nameVal.trim().slice(0, 8) });
      setEditing(false);
      playClick();
    }
  };

  const handleUnlockSettings = () => {
    if (pin === '20180704') {
      playUnlock();
      setSettingsUnlocked(true);
    } else {
      alert('序列号错误');
      setPin('');
    }
  };

  const handleSaveSettings = () => {
    playClick();
    setUser({ ...user, parentSettings: tempSettings });
    setShowParentSettings(false);
    setSettingsUnlocked(false);
    setPin('');
  };

  const handleResetIsland = () => {
    if (window.confirm('⚠️ 确定要重置岛屿探险进度吗？\n\n这将清空所有关卡的完成状态，孩子需要从第1关重新开始。\n\n放心，以下内容【不会】丢失：\n✨ 星星数量\n🏆 荣誉卡片\n🎒 背包道具与奖励')) {
      playClick();
      setUser({
        ...user,
        courseProgress: {
           ...user.courseProgress,
           [user.activeCourseId]: []
        }
      });
      alert('✅ 岛屿进度已重置，新的冒险开始啦！');
      setShowParentSettings(false);
      onClose();
    }
  };

  // --- Export / Import Logic ---
  const handleExportData = () => {
    const dataStr = JSON.stringify(user);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    // Create short date string YYMMDD
    const date = new Date();
    const yy = date.getFullYear().toString().substr(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const exportFileDefaultName = `island_${yy}${mm}${dd}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    playClick();
    alert('✅ 备份文件已下载！\n包含了：\n- 孩子昵称与星星 ✨\n- 所有的贴纸与卡片收藏 🦄\n- 学习进度与设置 📊');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsedData = JSON.parse(content);
          
          // Basic validation to ensure it's a valid save file
          if (parsedData && typeof parsedData.stars === 'number' && parsedData.courseProgress) {
             const confirmMsg = '⚠️ 确定要恢复这份存档吗？\n\n恢复后，当前的：\n- 星星数量\n- 收集的贴纸与卡片\n- 学习进度\n\n将全部替换为存档中的状态，且无法撤销！';
             if (window.confirm(confirmMsg)) {
               setUser(parsedData);
               alert('✅ 恢复成功！\n所有的星星、收藏和进度都已回来啦！');
               playUnlock();
               setShowParentSettings(false); // Close settings to refresh view context
             }
          } else {
             alert('❌ 无效的存档文件，请检查文件是否正确。');
          }
        }
      } catch (err) {
        alert('❌ 文件解析失败，请确保是有效的JSON文件。');
      }
    };
    // Reset value so same file can be selected again if needed
    event.target.value = '';
  };

  const addCustomReward = () => {
    if(!newRewardName.trim()) return;
    const newReward: CustomReward = {
      id: `r_${Date.now()}`,
      name: newRewardName,
      probability: newRewardProb
    };
    setTempSettings(prev => ({
      ...prev,
      customRewards: [...(prev.customRewards || []), newReward]
    }));
    setNewRewardName('');
  };

  const removeCustomReward = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      customRewards: prev.customRewards?.filter(r => r.id !== id) || []
    }));
  };

  const historyValues = Object.values(user.statsHistory || {}) as DailyStats[];
  const totalMistakes = historyValues.reduce((acc: number, day: DailyStats) => acc + day.mistakes, 0);
  const totalTime = historyValues.reduce((acc: number, day: DailyStats) => acc + day.timeSpentSeconds, 0);
  const totalHours = Math.floor(totalTime / 3600);
  const totalMins = Math.floor((totalTime % 3600) / 60);

  const mistakeDist: Record<string, number> = {};
  historyValues.forEach(day => {
    Object.entries(day.mistakesByCategory).forEach(([cat, count]) => {
      mistakeDist[cat] = (mistakeDist[cat] || 0) + (count as number);
    });
  });
  const maxMistakeVal = Math.max(...(Object.values(mistakeDist) as number[]), 1);

  const lastLevel = user.lastLevelStats;
  const lastLevelMins = lastLevel ? Math.floor(lastLevel.timeSpent / 60) : 0;
  const lastLevelSecs = lastLevel ? lastLevel.timeSpent % 60 : 0;
  const lastLevelMistakes = lastLevel ? (Object.values(lastLevel.mistakesByCat) as number[]).reduce((a: number, b: number) => a + b, 0) : 0;
  const maxMistakeLevelVal = lastLevel ? Math.max(...(Object.values(lastLevel.mistakesByCat) as number[]), 1) : 1;

  // Updated Labels for all categories
  const catLabels: Record<string, string> = { 
    basic:'计算', application:'应用', logic:'思维', emoji:'符号', 
    sentence:'连句', word:'填空', punctuation:'标点', antonym:'反义', synonym:'近义' 
  };

  const renderBarChart = (data: Record<string, number>, maxVal: number, colorClass: string, barColorClass: string) => {
    return (
      <div className="w-full flex gap-1 md:gap-2 h-24 items-end justify-around pb-2 overflow-x-auto">
          {Object.entries(catLabels).map(([cat, label]) => {
            const val = data[cat] || 0;
            const heightPct = (val / maxVal) * 100;
            return (
              <div key={cat} className="h-full flex flex-col justify-end items-center gap-1 flex-1 group min-w-[30px]">
                <div className={`w-full ${barColorClass} rounded-t-md md:rounded-t-lg transition-all duration-500 relative flex items-end justify-center`} style={{ height: `${heightPct}%`, minHeight: val > 0 ? '6px' : '2px' }}>
                  {val > 0 && <span className="text-[8px] md:text-[10px] text-gray-500 absolute -top-4 font-bold opacity-0 group-hover:opacity-100">{val}</span>}
                </div>
                <span className="text-[8px] md:text-[10px] text-gray-500 font-bold truncate w-full text-center">{label}</span>
              </div>
            )
          })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white p-6 md:p-10 flex flex-col items-center overflow-y-auto animate-fade-in font-standard">
       <button onClick={() => { playClick(); onClose(); }} className="absolute top-4 left-4 md:top-8 md:left-8 text-3xl md:text-5xl text-gray-300 hover:text-gray-500 transition-colors">✕</button>
       
       {!showParentSettings ? (
         <>
          <div 
            onClick={() => { playClick(); setShowAvatarSelector(true); }}
            className="mt-10 md:mt-10 w-32 h-32 md:w-40 md:h-40 bg-sky-50 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-[4rem] md:text-[5rem] border-[6px] md:border-[8px] border-white shadow-xl cursor-pointer relative group active:scale-95 transition-transform"
          >
            {user.avatar}
            <div className="absolute bottom-2 right-2 bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm group-hover:bg-sky-50">更换</div>
          </div>
          
          {editing ? (
            <div className="flex gap-2 mt-4 md:mt-4 items-center animate-pop">
                <input 
                  value={nameVal} 
                  onChange={e => setNameVal(e.target.value)}
                  className="border-4 border-sky-300 rounded-2xl px-4 py-2 text-2xl md:text-3xl font-black text-center w-56 md:w-64 outline-none focus:border-sky-500 bg-white"
                  autoFocus
                  maxLength={8}
                />
                <button onClick={handleSaveName} className="bg-green-500 text-white p-2 md:p-3 rounded-xl shadow-md active:scale-95 text-xl">✓</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-4 md:mt-4">
              <h2 onClick={() => { playClick(); setEditing(true); setNameVal(user.name); }} className="text-3xl md:text-4xl font-black text-sky-800 cursor-pointer border-b-2 border-transparent hover:border-sky-200 transition-all">
                {user.name} <span className="text-lg text-sky-300 ml-1">✎</span>
              </h2>
              <button 
                onClick={() => { playClick(); setShowParentSettings(true); }}
                className="bg-gray-100 text-gray-500 p-2 rounded-lg text-sm font-bold border-2 border-gray-200 hover:bg-gray-200 active:scale-95"
              >
                家长设置 ⚙️
              </button>
            </div>
          )}

          <div className="mt-8 md:mt-8 w-full max-w-2xl grid grid-cols-2 gap-4">
             <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 flex flex-col items-center">
                <span className="text-4xl mb-1">🔥</span>
                <span className="text-3xl font-black text-orange-600">{user.streak}</span>
                <span className="text-xs text-orange-400 font-bold uppercase">连续打卡天数</span>
             </div>
             <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-100 flex flex-col items-center">
                <span className="text-4xl mb-1">⏳</span>
                <span className="text-3xl font-black text-sky-600">{totalHours}h {totalMins}m</span>
                <span className="text-xs text-sky-400 font-bold uppercase">总学习时长</span>
             </div>

             <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex flex-col items-center col-span-2">
                <div className="w-full flex justify-between items-end mb-2 px-2">
                   <span className="font-bold text-red-800">总错题分布</span>
                   <span className="text-xs text-red-400 font-bold">累计: {totalMistakes}</span>
                </div>
                {renderBarChart(mistakeDist, maxMistakeVal, 'bg-red-50', 'bg-red-300')}
             </div>

             <div className="col-span-2 mt-2">
               <h3 className="font-black text-gray-500 text-lg mb-2 pl-2 border-l-4 border-green-400">上一关表现 {lastLevel && <span className="text-sm font-normal text-gray-400">Day {lastLevel.day}</span>}</h3>
               {lastLevel ? (
                 <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-2 bg-white/50 rounded-xl">
                       <span className="text-xs text-green-600 font-bold mb-1">通关用时</span>
                       <span className="text-2xl font-black text-green-700">{lastLevelMins}分{lastLevelSecs}秒</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white/50 rounded-xl">
                       <span className="text-xs text-amber-600 font-bold mb-1">最强连击</span>
                       <span className="text-2xl font-black text-amber-600">x{lastLevel.maxCombo}</span>
                    </div>
                    
                    <div className="col-span-2 mt-2">
                      <div className="w-full flex justify-between items-end mb-2 px-1">
                        <span className="text-xs font-bold text-green-800">本关错题分布</span>
                        <span className="text-xs font-bold text-green-600">错题数: {lastLevelMistakes}</span>
                      </div>
                      {renderBarChart(lastLevel.mistakesByCat, maxMistakeLevelVal, 'bg-green-50', 'bg-green-300')}
                    </div>
                 </div>
               ) : (
                 <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold">
                    还没有完成过关卡哦，快去挑战吧！
                 </div>
               )}
             </div>
          </div>
          
          {showAvatarSelector && (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAvatarSelector(false)}>
              <div className="bg-white p-6 rounded-[2rem] w-full max-w-sm border-4 border-sky-100 shadow-2xl" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-black text-gray-700">更换头像</h3>
                   <button onClick={() => setShowAvatarSelector(false)} className="text-gray-400 text-2xl">✕</button>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    {AVATARS.filter(a => user.unlockedItems.includes(a.id)).map(a => (
                      <button 
                        key={a.id}
                        onClick={() => { playClick(); setUser({...user, avatar: a.icon}); setShowAvatarSelector(false); }}
                        className={`p-4 rounded-xl text-4xl border-2 transition-all ${user.avatar === a.icon ? 'bg-sky-100 border-sky-400' : 'bg-gray-50 border-gray-100 hover:bg-sky-50'}`}
                      >
                        {a.icon}
                      </button>
                    ))}
                 </div>
                 {AVATARS.every(a => !user.unlockedItems.includes(a.id)) && <p className="text-gray-400 text-center py-4">还没有解锁其他头像哦</p>}
              </div>
            </div>
          )}
         </>
       ) : (
         <div className="mt-10 md:mt-20 w-full max-w-xl animate-pop pb-20">
           <h2 className="text-3xl font-black text-gray-700 mb-6 text-center">家长设置 ⚙️</h2>
           {!settingsUnlocked ? (
             <div className="flex flex-col items-center gap-4 bg-gray-50 p-8 rounded-3xl border-2 border-gray-100">
               <p className="text-gray-500 font-medium">请输入序列号解锁设置</p>
               <input 
                 type="password" 
                 value={pin} 
                 onChange={e => setPin(e.target.value)} 
                 placeholder="输入序列号"
                 className="w-full p-4 rounded-xl border-2 border-gray-300 text-center text-2xl tracking-widest outline-none focus:border-sky-500"
               />
               <div className="flex gap-4 w-full">
                 <button onClick={() => { playClick(); setShowParentSettings(false); }} className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold">返回</button>
                 <button onClick={handleUnlockSettings} className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold">解锁</button>
               </div>
             </div>
           ) : (
             <div className="bg-white border-2 border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-8">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">每日题量配置</h3>
                  <div className="space-y-4">
                    {(Object.keys(tempSettings.questionCounts) as QuestionCategory[]).map(cat => {
                      const labelMap: Record<string, string> = { 
                        basic:'数学计算', application:'数学应用', logic:'数学思维', emoji:'趣味符号',
                        sentence:'语文连句', word:'语文填空', punctuation:'标点符号', antonym:'反义词', synonym:'近义词' 
                      };
                      return (
                        <div key={cat} className="flex items-center justify-between border-b border-gray-50 last:border-0 py-2">
                          <span className="font-medium text-gray-600">{labelMap[cat] || cat}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => { playClick(); setTempSettings(prev => ({...prev, questionCounts: {...prev.questionCounts, [cat]: Math.max(0, prev.questionCounts[cat] - 1)}})) }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600">-</button>
                            <span className="w-6 text-center font-bold text-lg">{tempSettings.questionCounts[cat]}</span>
                            <button onClick={() => { playClick(); setTempSettings(prev => ({...prev, questionCounts: {...prev.questionCounts, [cat]: Math.min(20, prev.questionCounts[cat] + 1)}})) }} className="w-8 h-8 rounded-full bg-sky-100 hover:bg-sky-200 font-bold text-sky-600">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">出题模式</h3>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <span className="font-medium text-gray-600">题目乱序</span>
                    <button 
                      onClick={() => { playClick(); setTempSettings(prev => ({...prev, shuffleQuestions: !prev.shuffleQuestions})) }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors ${tempSettings.shuffleQuestions ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${tempSettings.shuffleQuestions ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">🎁 宝箱奖励设置</h3>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                     <p className="text-xs text-amber-600 mb-2">孩子每次通关后会开宝箱。系统会先按概率判断是否给予下方设置的“家长奖励”。若未中奖，则随机给予贴纸、卡片或拼图。</p>
                     
                     <div className="space-y-2 mb-4">
                        {tempSettings.customRewards?.map((r) => (
                          <div key={r.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border">
                             <span className="font-bold text-gray-700 flex-1">{r.name}</span>
                             <span className="text-sm font-bold text-sky-500 mr-4">{r.probability}%概率</span>
                             <button onClick={() => removeCustomReward(r.id)} className="text-red-400 hover:text-red-600 px-2 font-bold">×</button>
                          </div>
                        ))}
                        {(!tempSettings.customRewards || tempSettings.customRewards.length === 0) && (
                          <div className="text-gray-400 text-sm italic text-center py-2">暂无自定义奖励</div>
                        )}
                     </div>

                     <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 block mb-1">奖品名称</label>
                          <input 
                             value={newRewardName} 
                             onChange={e => setNewRewardName(e.target.value)}
                             placeholder="如：奖励1元"
                             className="w-full p-2 rounded-lg border text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-xs text-gray-500 block mb-1">中奖率%</label>
                          <input 
                             type="number"
                             min="1"
                             max="100"
                             value={newRewardProb} 
                             onChange={e => setNewRewardProb(Number(e.target.value))}
                             className="w-full p-2 rounded-lg border text-sm text-center"
                          />
                        </div>
                        <button 
                          onClick={addCustomReward}
                          disabled={!newRewardName.trim()}
                          className="bg-sky-500 text-white p-2 rounded-lg font-bold text-sm h-[38px] disabled:bg-gray-300"
                        >
                          添加
                        </button>
                     </div>
                  </div>
                </div>
                
                {/* Data Backup & Restore Section */}
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">📦 数据备份与恢复</h3>
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col gap-4">
                     <p className="text-xs text-blue-600">您可以将当前的学习进度、收集的贴纸卡片等完整导出保存，或在其他设备上恢复。</p>
                     
                     <div className="flex gap-4">
                        <button 
                           onClick={handleExportData}
                           className="flex-1 bg-white border-2 border-blue-200 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-100 active:scale-95 shadow-sm"
                        >
                           📥 导出完整备份
                        </button>
                        <label className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 active:scale-95 shadow-sm text-center cursor-pointer">
                           📤 恢复备份数据
                           <input 
                              type="file" 
                              accept=".json"
                              onChange={handleImportData}
                              className="hidden" 
                           />
                        </label>
                     </div>
                     <p className="text-[10px] text-gray-400 text-center">注意：恢复将覆盖当前设备上的所有进度。</p>
                  </div>
                </div>

                {/* Reset Island Section */}
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-4 border-b border-red-100 pb-2">🚨 危险区域</h3>
                  <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                           <h4 className="font-bold text-gray-700">重置关卡进度</h4>
                           <p className="text-xs text-gray-500 mt-1">仅重置地图关卡，星星和收藏品保留。</p>
                        </div>
                        <button 
                           onClick={handleResetIsland}
                           className="bg-white border-2 border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 active:scale-95 shadow-sm text-sm"
                        >
                           重置岛屿
                        </button>
                      </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button onClick={() => { playClick(); setShowParentSettings(false); }} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">取消</button>
                   <button onClick={handleSaveSettings} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-md active:translate-y-1">保存设置</button>
                </div>
             </div>
           )}
         </div>
       )}
    </div>
  );
};
