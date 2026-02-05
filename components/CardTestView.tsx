
import React, { useState, useEffect } from 'react';
import { playClick } from '../sound';

// A single card tester component that tries multiple file variations
const TestCard: React.FC<{ id: number }> = ({ id }) => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'warning' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [finalSrc, setFinalSrc] = useState<string | null>(null);

  // List of variations to try if the default fails
  const attempts = [
    // 1. Try honor relative path (new location)
    { path: `media/honor/card_${id}.png`, label: 'correct_honor' },
    // 2. Try old path just in case
    { path: `media/card_${id}.png`, label: 'old_path' },
    // 3. Try jpg extension
    { path: `media/honor/card_${id}.jpg`, label: 'wrong_ext' },
  ];

  useEffect(() => {
    let active = true;

    const tryLoad = async (index: number) => {
      if (!active) return;
      if (index >= attempts.length) {
        setStatus('error');
        return;
      }

      const attempt = attempts[index];
      // Add timestamp to bypass cache
      const src = `${attempt.path}?t=${Date.now()}`;

      const img = new Image();
      img.onload = () => {
        if (!active) return;
        setFinalSrc(src);
        
        if (attempt.label === 'correct_honor') {
          setStatus('ok');
        } else {
          setStatus('warning');
          if (attempt.label === 'old_path') {
            setMessage(`路径错误 (仍在 media/)`);
          } else if (attempt.label === 'wrong_ext') {
            setMessage(`格式应为 .png`);
          }
        }
      };

      img.onerror = () => {
        // Try next candidate
        tryLoad(index + 1);
      };

      img.src = src;
    };

    tryLoad(0);

    return () => { active = false; };
  }, [id]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-full aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden relative shadow-sm border-4 transition-all ${
        status === 'loading' ? 'border-gray-200 animate-pulse' :
        status === 'ok' ? 'border-green-500' :
        status === 'warning' ? 'border-amber-400' :
        'border-red-500 opacity-50'
      }`}>
         {finalSrc && (
           <img src={finalSrc} alt={`Card ${id}`} className="w-full h-full object-contain p-1" />
         )}
         
         {status === 'error' && (
           <div className="absolute inset-0 flex items-center justify-center flex-col text-red-400 p-2 text-center">
              <span className="text-2xl font-black">×</span>
              <span className="text-[8px]">未找到</span>
           </div>
         )}
         
         <div className="absolute top-0 left-0 bg-black/50 text-white text-[10px] px-1 rounded-br font-mono">#{id}</div>
      </div>
      
      <div className="text-center w-full px-1">
         {status === 'ok' && <div className="text-[10px] text-green-600 font-bold">正常</div>}
         {status === 'error' && <div className="text-[10px] text-red-500 font-bold break-all">media/honor/card_{id}.png</div>}
         {status === 'warning' && (
           <div className="text-[9px] bg-amber-100 text-amber-700 p-1 rounded break-all leading-tight">
             {message}
           </div>
         )}
      </div>
    </div>
  );
};

export const CardTestView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Only checking 1 to 10 as per user update
  const cards = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleResetSystem = async () => {
    if (!window.confirm("确定要重置缓存并刷新吗？")) return;
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) await caches.delete(key);
    }
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto p-4 font-standard">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur py-4 border-b z-10 gap-4 shadow-sm px-2">
        <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800">🕵️‍♀️ 卡片资源侦探</h2>
            <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-3">
              <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> 完美 (media/honor/...)</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> 缺失</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => { playClick(); handleResetSystem(); }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg font-bold text-sm active:scale-95"
            >
                ↻ 强制刷新
            </button>
            <button
                onClick={() => { playClick(); onClose(); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-bold active:scale-95"
            >
                关闭
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-4 gap-y-6 pb-20">
        {cards.map(num => (
          <TestCard key={num} id={num} />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
         <p>提示：请确保图片文件位于 public/media/honor/ 目录下，且命名为 card_1.png 至 card_10.png</p>
         <p>当前检测路径：media/honor/card_x.png (相对路径)</p>
      </div>
    </div>
  );
};
