import React, { useState, useRef, useEffect } from 'react';
import { UserState, AchievementCard } from '../types';
import { DECORATIONS, AVATARS } from '../constants';
import { playClick, playUnlock } from '../sound';
import { generateCardDataUri } from '../utils/helpers';
import { HonorCard } from './HonorCard';
import { useCards } from '../hooks/useCards';
import { ImageLoader } from './ImageLoader';

export const StoreView: React.FC<{ user: UserState; setUser: (u: UserState) => void; onClose: () => void }> = ({ user, setUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'bag' | 'deco'>('deco');
  
  const { cards: honorCards, unlockedCards } = useCards(user, setUser);
  
  // For viewing Game Cards (Images) in bag
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // For Honor Card Zoom & Flip Logic
  const [viewingCard, setViewingCard] = useState<AchievementCard | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // For Locked Honor Card Tooltip
  const [lockedCardId, setLockedCardId] = useState<string | null>(null);
  const lockedCardTimerRef = useRef<number>(0);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearTimeout(lockedCardTimerRef.current);
    };
  }, []);

  const handleLockedCardClick = (id: string) => {
    clearTimeout(lockedCardTimerRef.current);
    setLockedCardId(id);
    lockedCardTimerRef.current = window.setTimeout(() => {
      setLockedCardId(null);
    }, 3000);
  };

  // Safe filtering: checking if 'i' exists before accessing 'i.type'
  const stickers = user.inventory?.filter(i => i && i.type === 'sticker') || [];
  const inventoryCards = user.inventory?.filter(i => i && i.type === 'card') || [];
  const coupons = user.inventory?.filter(i => i && i.type === 'custom_coupon') || [];

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
            头像与装饰 🏰
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
                 
                 {/* Avatars Section (Merged) */}
                 <div className="bg-white p-4 rounded-3xl border-4 border-purple-100">
                   <h3 className="font-black text-lg mb-4 text-purple-800">🧙‍♂️ 魔法头像</h3>
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {AVATARS.map(a => {
                      const owned = user.unlockedItems.includes(a.id);
                      return (
                        <div key={a.id} className="flex flex-col items-center gap-2 p-2">
                          <div className="text-5xl md:text-6xl">{a.icon}</div>
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
                              className={`w-full py-1 rounded-full font-black text-xs md:text-sm transition-all ${user.avatar === a.icon ? 'bg-sky-100 text-sky-500' : owned ? 'bg-sky-500 text-white' : user.stars >= a.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                          >
                            {user.avatar === a.icon ? '使用中' : owned ? '使用' : `${a.cost} ⭐`}
                          </button>
                        </div>
                      );
                    })}
                   </div>
                 </div>

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

            {activeTab === 'cards' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 animate-fade-in p-2">
                {honorCards.map(card => {
                  const unlocked = unlockedCards.includes(card.id);
                  const isLockedSelected = lockedCardId === card.id;
                  
                  return (
                    <div 
                      key={card.id}
                      onClick={() => {
                         playClick();
                         if (unlocked) {
                           setViewingCard(card);
                           setIsCardFlipped(false);
                         } else {
                           handleLockedCardClick(card.id);
                         }
                      }}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border-2 p-2 cursor-pointer transition-transform hover:scale-105 ${
                        unlocked 
                          ? card.colorClass
                          : 'bg-gray-100 border-gray-200 opacity-80'
                      }`}
                    >
                        <div className="w-full h-full relative overflow-hidden rounded-lg mb-1 flex items-center justify-center bg-white/50">
                          {unlocked ? (
                             <ImageLoader 
                               src={`${card.image}?v=1`} 
                               alt={card.title}
                               className="w-full h-full object-contain"
                               fallbackText={card.title.substring(0, 1)}
                             />
                          ) : (
                             <div className="text-3xl md:text-4xl opacity-30">🔒</div>
                          )}
                        </div>
                        <div className={`text-[10px] md:text-xs font-bold text-center truncate w-full ${unlocked ? '' : 'text-gray-400'}`}>
                          {card.title}
                        </div>

                        {/* Lock Condition Overlay (Inside Card) */}
                        {!unlocked && isLockedSelected && (
                           <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-white p-2 text-center animate-fade-in shadow-inner">
                              <div className="font-bold mb-2 text-amber-300 text-xs">🔒 解锁条件</div>
                              <div className="text-[10px] leading-relaxed font-medium text-gray-100">{card.conditionText}</div>
                           </div>
                        )}
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
                        🦄 收藏集 <span className="text-sm font-normal text-gray-400">(贴纸与珍稀卡片)</span>
                     </h3>
                     {stickers.length === 0 && inventoryCards.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl">空空如也，快去探险吧！</div>
                     ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                           {/* Render Cards First */}
                           {inventoryCards.map(c => (
                             <div 
                               key={c.id} 
                               onClick={() => { playClick(); setViewingImage(c.icon); }}
                               className="aspect-square flex flex-col items-center justify-center bg-yellow-50 rounded-xl border-2 border-yellow-200 p-2 cursor-pointer hover:scale-105 transition-transform"
                             >
                                <div className="w-full h-full relative overflow-hidden rounded-lg mb-1 flex items-center justify-center">
                                   <ImageLoader 
                                     src={`${c.icon}?v=1`} 
                                     alt={c.name} 
                                     className="w-full h-full"
                                     fallbackText={c.name.replace(/\D/g, '') || 'C'}
                                   />
                                </div>
                                <div className="text-[10px] md:text-xs text-yellow-700 font-bold text-center truncate w-full">{c.name}</div>
                             </div>
                           ))}
                           {/* Render Stickers */}
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

       {/* View Large Card Modal (Honor Cards) */}
       {viewingCard && (
         <div 
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" 
            onClick={() => setViewingCard(null)}
         >
            <div className="relative w-full max-w-sm md:max-w-md bg-transparent flex flex-col items-center" onClick={e => e.stopPropagation()}>
               {/* Close Button */}
               <button onClick={() => setViewingCard(null)} className="absolute -top-12 right-0 text-white text-4xl opacity-70 hover:opacity-100">✕</button>
               
               {/* Wrapper with island-float animation */}
               <div 
                  className="w-full aspect-[3/5] island-float relative cursor-pointer" 
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
               >
                 <HonorCard 
                    card={viewingCard} 
                    unlocked={true} 
                    isFlipped={isCardFlipped}
                    variant="modal"
                 />
               </div>
               
               <div className="mt-8 text-white font-black text-xl tracking-widest uppercase opacity-80 text-center">
                  {viewingCard.title}
               </div>
               <p className="text-white/40 text-xs mt-2 font-medium">点击卡片翻转查看详情</p>
            </div>
         </div>
       )}

       {/* View Large Image Modal (Game Collection Cards) */}
       {viewingImage && (
         <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setViewingImage(null)}>
            <div className="relative w-full max-w-md bg-transparent flex flex-col items-center" onClick={e => e.stopPropagation()}>
               <button onClick={() => setViewingImage(null)} className="absolute -top-12 right-0 text-white text-4xl opacity-70 hover:opacity-100">✕</button>
               <div className="w-full bg-white p-4 rounded-[2rem] shadow-2xl island-float border-4 border-amber-300 relative min-h-[200px] flex items-center justify-center">
                  <ImageLoader 
                    src={`${viewingImage}?v=1`}
                    alt="Card" 
                    className="w-full h-auto rounded-xl"
                  />
               </div>
               <div className="mt-8 text-white font-black text-xl tracking-widest uppercase opacity-80">珍贵收藏</div>
            </div>
         </div>
       )}
    </div>
  );
};