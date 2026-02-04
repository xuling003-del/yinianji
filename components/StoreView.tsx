
import React, { useState } from 'react';
import { UserState } from '../types';
import { ACHIEVEMENT_CARDS, DECORATIONS, AVATARS } from '../constants';
import { playClick, playUnlock } from '../sound';

export const StoreView: React.FC<{ user: UserState; setUser: (u: UserState) => void; onClose: () => void }> = ({ user, setUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'cards' | 'bag' | 'deco'>('deco');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = ACHIEVEMENT_CARDS.find(c => c.id === selectedCardId);

  const stickers = user.inventory?.filter(i => i.type === 'sticker') || [];
  const coupons = user.inventory?.filter(i => i.type === 'custom_coupon') || [];

  return (
    <div className="fixed inset-0 z-[100] bg-sky-50 flex flex-col items-center overflow-hidden font-standard">
       <div className="w-full p-4 flex justify-between items-center z-10 bg-sky-50/90 backdrop-blur-sm">
         <button onClick={() => { playClick(); onClose(); }} className="text-3xl md:text-5xl text-gray-300 hover:text-gray-500">✕</button>
         <h2 className="text-2xl md:text-4xl font-black text-amber-600 font-playful">✨ 宝藏店 ✨</h2>
         <div className="w-8"></div>
       </div>

       <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 p-1 bg-white rounded-xl border-2 border-amber-100 shadow-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => { playClick(); setActiveTab('deco'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'deco' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
          >
            装饰岛屿 🏰
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('avatar'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'avatar' ? 'bg-sky-100 text-sky-600' : 'text-gray-400'}`}
          >
            魔法皮肤 👕
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('cards'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'cards' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
          >
            荣誉卡片 🏆
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('bag'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'bag' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
          >
            我的背包 🎒
          </button>
       </div>

       <div className="flex-1 w-full overflow-y-auto px-4 pb-20 flex flex-col items-center">
          <div className="w-full max-w-5xl">

            {activeTab === 'deco' && (
              <div className="animate-fade-in space-y-6">
                 <div className="bg-white p-4 rounded-3xl border-4 border-sky-100">
                   <h3 className="font-black text-lg mb-4 text-sky-800">🌈 岛屿主题</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DECORATIONS.filter(d => d.type === 'theme').map(d => {
                        const owned = user.unlockedItems.includes(d.id) || d.cost === 0;
                        const active = user.activeDecorations.theme === d.id;
                        return (
                          <div key={d.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${active ? 'bg-sky-50 border-sky-500' : 'bg-gray-50 border-gray-100'}`}>
                             <div className="text-4xl">{d.icon}</div>
                             <span className="font-bold text-sm text-gray-700">{d.name}</span>
                             <button
                               onClick={() => {
                                 if (active) {
                                   if (d.id !== 'theme_sky') {
                                      playClick();
                                      setUser({...user, activeDecorations: {...user.activeDecorations, theme: 'theme_sky'}});
                                   }
                                   return;
                                 }
                                 if (owned) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, theme: d.id}});
                                 } else if (user.stars >= d.cost) {
                                   playUnlock();
                                   setUser({
                                     ...user, 
                                     stars: user.stars - d.cost, 
                                     unlockedItems: [...user.unlockedItems, d.id],
                                     activeDecorations: {...user.activeDecorations, theme: d.id}
                                   });
                                 }
                               }}
                               className={`text-xs px-3 py-1 rounded-full font-black ${active ? 'bg-green-500 text-white' : owned ? 'bg-sky-500 text-white' : user.stars >= d.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                             >
                               {active ? '使用中' : owned ? '使用' : `${d.cost} ⭐`}
                             </button>
                          </div>
                        )
                      })}
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-3xl border-4 border-amber-100">
                   <h3 className="font-black text-lg mb-4 text-amber-800">🏠 岛屿建筑</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DECORATIONS.filter(d => d.type === 'building').map(d => {
                        const owned = user.unlockedItems.includes(d.id) || d.cost === 0;
                        const active = user.activeDecorations.building === d.id;
                        return (
                          <div key={d.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${active ? 'bg-amber-50 border-amber-500' : 'bg-gray-50 border-gray-100'}`}>
                             <div className="text-4xl">{d.icon}</div>
                             <span className="font-bold text-sm text-gray-700">{d.name}</span>
                             <button
                               onClick={() => {
                                 if (active) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, building: ''}});
                                   return;
                                 }
                                 if (owned) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, building: d.id}});
                                 } else if (user.stars >= d.cost) {
                                   playUnlock();
                                   setUser({
                                     ...user, 
                                     stars: user.stars - d.cost, 
                                     unlockedItems: [...user.unlockedItems, d.id],
                                     activeDecorations: {...user.activeDecorations, building: d.id}
                                   });
                                 }
                               }}
                               className={`text-xs px-3 py-1 rounded-full font-black ${active ? 'bg-green-500 text-white' : owned ? 'bg-sky-500 text-white' : user.stars >= d.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                             >
                               {active ? '取消' : owned ? '使用' : `${d.cost} ⭐`}
                             </button>
                          </div>
                        )
                      })}
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-3xl border-4 border-rose-100">
                   <h3 className="font-black text-lg mb-4 text-rose-800">🐾 岛屿宠物</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DECORATIONS.filter(d => d.type === 'pet').map(d => {
                        const owned = user.unlockedItems.includes(d.id) || d.cost === 0;
                        const active = user.activeDecorations.pet === d.id;
                        return (
                          <div key={d.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${active ? 'bg-rose-50 border-rose-500' : 'bg-gray-50 border-gray-100'}`}>
                             <div className="text-4xl">{d.icon}</div>
                             <span className="font-bold text-sm text-gray-700">{d.name}</span>
                             <button
                               onClick={() => {
                                 if (active) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, pet: ''}});
                                   return;
                                 }
                                 if (owned) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, pet: d.id}});
                                 } else if (user.stars >= d.cost) {
                                   playUnlock();
                                   setUser({
                                     ...user, 
                                     stars: user.stars - d.cost, 
                                     unlockedItems: [...user.unlockedItems, d.id],
                                     activeDecorations: {...user.activeDecorations, pet: d.id}
                                   });
                                 }
                               }}
                               className={`text-xs px-3 py-1 rounded-full font-black ${active ? 'bg-green-500 text-white' : owned ? 'bg-sky-500 text-white' : user.stars >= d.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                             >
                               {active ? '取消' : owned ? '使用' : `${d.cost} ⭐`}
                             </button>
                          </div>
                        )
                      })}
                   </div>
                 </div>
              </div>
            )}
            
            {activeTab === 'avatar' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
                {AVATARS.map(a => {
                  const owned = user.unlockedItems.includes(a.id);
                  return (
                    <div key={a.id} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-xl flex flex-col items-center gap-4 md:gap-6 border-4 border-white">
                      <div className="text-6xl md:text-8xl">{a.icon}</div>
                      <button 
                          disabled={owned && user.avatar === a.icon}
                          onClick={() => {
                            if (owned) {
                              playClick();
                              setUser({...user, avatar: a.icon});
                            } else if (user.stars >= a.cost) {
                              playUnlock();
                              setUser({...user, stars: user.stars - a.cost, unlockedItems: [...user.unlockedItems, a.id], avatar: a.icon});
                            }
                          }}
                          className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-lg md:text-xl transition-all ${user.avatar === a.icon ? 'bg-sky-100 text-sky-500' : owned ? 'bg-sky-500 text-white' : user.stars >= a.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                      >
                        {user.avatar === a.icon ? '使用中' : owned ? '更换' : `${a.cost} ⭐`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                {ACHIEVEMENT_CARDS.map(card => {
                  const unlocked = user.unlockedAchievements?.includes(card.id);
                  return (
                    <div 
                      key={card.id} 
                      onClick={() => {
                        if (unlocked) {
                          playClick();
                          setSelectedCardId(card.id);
                        }
                      }}
                      className={`relative aspect-[3/4] rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center p-2 text-center group ${unlocked ? 'bg-white border-white shadow-xl cursor-pointer hover:scale-105 rotate-0' : 'bg-gray-200 border-gray-300 opacity-80 cursor-not-allowed grayscale'}`}
                    >
                       <div className="text-4xl md:text-6xl mb-2">{unlocked ? card.icon : '🔒'}</div>
                       <h3 className={`font-black text-sm md:text-lg mb-1 ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>{card.title}</h3>
                       {!unlocked && (
                         <div className="absolute inset-0 bg-gray-900/10 rounded-xl flex items-end justify-center p-2">
                            <span className="text-[10px] md:text-xs font-bold text-white bg-gray-600 px-2 py-1 rounded-full">{card.conditionText}</span>
                         </div>
                       )}
                       {unlocked && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">点击查看</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'bag' && (
               <div className="space-y-8 animate-fade-in">
                  
                  <div className="bg-white p-4 md:p-6 rounded-3xl border-4 border-sky-100">
                     <h3 className="font-black text-xl text-gray-700 mb-4 flex items-center gap-2">
                        🎟️ 兑换券 <span className="text-sm font-normal text-gray-400">(找爸爸妈妈兑换)</span>
                     </h3>
                     {coupons.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl">还未获得兑换券，去闯关开宝箱吧！</div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {coupons.map(c => (
                             <div key={c.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl shadow-sm">
                                <div className="text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm">🎁</div>
                                <div className="flex-1">
                                   <div className="font-bold text-orange-800">{c.name}</div>
                                   <div className="text-xs text-orange-500">{new Date(c.obtainedAt).toLocaleDateString()} 获得</div>
                                </div>
                                <button 
                                  onClick={() => {
                                     if(confirm('确定要兑换并消耗这张券吗？')) {
                                       setUser({...user, inventory: user.inventory.filter(i => i.id !== c.id)});
                                     }
                                  }}
                                  className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded-full border border-orange-200 active:scale-95"
                                >
                                   兑换
                                </button>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-3xl border-4 border-indigo-100">
                     <h3 className="font-black text-xl text-gray-700 mb-4 flex items-center gap-2">
                        🦄 贴纸集 <span className="text-sm font-normal text-gray-400">({stickers.length}个)</span>
                     </h3>
                     {stickers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl">空空如也</div>
                     ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                           {stickers.map(s => (
                             <div key={s.id} className="aspect-square flex flex-col items-center justify-center bg-indigo-50/50 rounded-xl border border-indigo-100 p-2">
                                <div className="text-4xl md:text-5xl mb-1 animate-pop">{s.icon}</div>
                                <div className="text-[10px] md:text-xs text-indigo-400 font-bold text-center truncate w-full">{s.name}</div>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>

               </div>
            )}
          </div>
       </div>

       {selectedCard && (
         <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedCardId(null)}>
            <div className={`w-full max-w-sm ${selectedCard.colorClass} border-4 bg-white p-8 rounded-[2rem] shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center relative`} onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedCardId(null)} className="absolute top-4 right-4 text-2xl opacity-50 hover:opacity-100">✕</button>
               <div className="text-[6rem] mb-4 animate-bounce">{selectedCard.icon}</div>
               <h2 className="text-3xl font-black mb-2">{selectedCard.title}</h2>
               <div className="w-16 h-1 bg-current opacity-20 rounded-full mb-6"></div>
               <p className="text-xl font-bold leading-relaxed opacity-90">{selectedCard.message}</p>
               <div className="mt-8 text-xs font-bold uppercase tracking-widest opacity-50">Honor Card</div>
            </div>
         </div>
       )}
    </div>
  );
};
