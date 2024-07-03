'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import MemeImage from './meme-image';

interface AnimatorProps {
  className?: string;
}

interface MemeImageProps {
  id: string;
  src: string;
  x: number;
  y: number;
  animation: string;
  selectedAnimation: string;
  loaded: boolean;
  isTalking: boolean;
  width: number;
  height: number;
  onRemove: (id: string) => void;
  onAnimationChange: (id: string, animation: string) => void;
  onStartTalk: (id: string) => void;
  onStopTalk: (id: string) => void;
  singleLoopAnimations: string[];
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const Animator = ({ className }: AnimatorProps) => {
  const singleLoopAnimations = ['talk', 'walk', 'wave', 'jump', 'spin', 'pulse', 'shake', 'dance'];
  const [images, setImages] = useState<Array<MemeImageProps>>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const img = new Image();
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const maxSize = 300; // 最サイズを300pxに設定
            let width, height;
            if (img.width > img.height) {
              width = maxSize;
              height = maxSize / aspectRatio;
            } else {
              height = maxSize;
              width = maxSize * aspectRatio;
            }
            const newImage: Partial<MemeImageProps> = {
              id: Date.now().toString(),
              src: result,
              x: e.clientX - width / 2,
              y: e.clientY - height / 2,
              width,
              height,
              animation: 'none',
              selectedAnimation: 'talk',
              loaded: true,
              isTalking: false
            };
            setImages(prev => [...prev, newImage as MemeImageProps]);
            console.log('新しい画像が追加されました:', newImage);
          };
          img.src = result;
        }
      };

      reader.onerror = (error) => {
        console.error('ファイルの読み込みに失敗しました:', error);
      };

      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const startTalk = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, isTalking: true, animation: img.selectedAnimation } : img
    ));
  }, []);

  const stopTalk = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, isTalking: false, animation: 'none' } : img
    ));
  }, []);

  const changeAnimation = useCallback((id: string, animation: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, selectedAnimation: animation } : img
    ));
  }, []);

  return (
    <div
      className={`relative w-full h-screen ${className}`}
      style={{ backgroundColor: '#00B140' }}  // クロマキーグリーン
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <style jsx global>{`
        @keyframes idle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes walk { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(15px); } }
        @keyframes wave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(15deg); } }
        @keyframes jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes dance { 0%, 100% { transform: skew(0deg, 0deg) scale(1); } 25% { transform: skew(3deg, 3deg) scale(0.95); } 75% { transform: skew(-3deg, -3deg) scale(1.05); } }
        @keyframes talk {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.1); }
        }
      `}</style>
      {images.map(image => (
        <MemeImage
          key={image.id}
          image={{ ...image, id: image.id.toString() }}
          onRemove={removeImage}
          onAnimationChange={changeAnimation}
          onStartTalk={startTalk}
          onStopTalk={stopTalk}
          singleLoopAnimations={singleLoopAnimations}
        />
      ))}
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-center text-2xl">
            画像をここにドラッグ＆ドロップしてください
          </p>
        </div>
      )}
    </div>
  );
};

export default Animator;
