import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Menu, Maximize2 } from 'lucide-react';

interface MemeImageProps {
  image: {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    selectedAnimation: string;
  };
  onRemove: (id: string) => void;
  onAnimationChange: (id: string, animation: string) => void;
  onStartTalk: (id: string) => void;
  onStopTalk: (id: string) => void;
  singleLoopAnimations: string[];
}

interface Window {
  webkitSpeechRecognition: any;
}

type SpeechRecognition = any;

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
}

const MemeImage = ({ image, onRemove, onAnimationChange, onStartTalk, onStopTalk, singleLoopAnimations }: MemeImageProps) => {
  const [position, setPosition] = useState({ x: image.x, y: image.y });
  const [size, setSize] = useState({ width: image.width || 200, height: image.height || 200 });
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(image.selectedAnimation || 'none');
  const [isRandomAnimating, setIsRandomAnimating] = useState(false);

  const [recognitionState, setRecognitionState] = useState<'inactive' | 'active'>('inactive');
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAnimationChange = useCallback((animation: string) => {
    setSelectedAnimation(animation);
    onAnimationChange(image.id, animation);
    setIsRandomAnimating(animation === 'random');
  }, [image.id, onAnimationChange]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsSpeaking(false);
    onStopTalk(image.id);
    setRecognitionState('inactive');
  }, [image.id, onStopTalk]);

  const startSpeechRecognition = useCallback(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setRecognitionState('active');
      };

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (!result.isFinal) {
          setIsSpeaking(true);
          onStartTalk(image.id);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setIsSpeaking(false);
            onStopTalk(image.id);
          }, 1000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('音声認識エラー', event.error);
        stopSpeechRecognition();
      };

      recognitionRef.current.onend = () => {
        if (recognitionState === 'active') {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('音声認識の再開に失敗しました', error);
            setRecognitionState('inactive');
          }
        }
      };

      try {
        recognitionRef.current.start();
        setRecognitionState('active');
      } catch (error) {
        console.error('音声認識の開始に失敗しました', error);
        setRecognitionState('inactive');
      }
    } else {
      console.error('音声認識がサポートされていません');
      setRecognitionState('inactive');
    }
  }, [image.id, onStartTalk, onStopTalk, stopSpeechRecognition, recognitionState]);

  useEffect(() => {
    startSpeechRecognition();
    return () => {
      stopSpeechRecognition();
    };
  }, [startSpeechRecognition, stopSpeechRecognition]);

  useEffect(() => {
    let animationInterval: NodeJS.Timeout;
    if (isRandomAnimating && isSpeaking) {
      animationInterval = setInterval(() => {
        const randomAnimation = singleLoopAnimations[Math.floor(Math.random() * singleLoopAnimations.length)];
        onAnimationChange(image.id, randomAnimation);
      }, 2000);
    }
    return () => clearInterval(animationInterval);
  }, [isRandomAnimating, isSpeaking, image.id, onAnimationChange, singleLoopAnimations]);

  useEffect(() => {
    if (isSpeaking) {
      if (selectedAnimation === 'random') {
        const randomAnimation = singleLoopAnimations[Math.floor(Math.random() * singleLoopAnimations.length)];
        onAnimationChange(image.id, randomAnimation);
      } else if (selectedAnimation !== 'none') {
        onAnimationChange(image.id, selectedAnimation);
      }
    } else {
      onAnimationChange(image.id, 'none');
    }
  }, [isSpeaking, selectedAnimation, image.id, onAnimationChange, singleLoopAnimations]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + e.clientX - startX;
      const newHeight = startHeight + e.clientY - startY;
      setSize({
        width: Math.max(50, newWidth),
        height: Math.max(50, newHeight)
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    setShowMenu(prev => !prev);
  }, []);

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const startRotation = rotation;

    const handleMouseMove = (e: MouseEvent) => {
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const newRotation = startRotation + (angle - startAngle) * (180 / Math.PI);
      setRotation(newRotation % 360);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [rotation]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (imageRef.current && !imageRef.current.contains(e.target as Node)) {
        setIsSelected(false);
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.style.animation = `${image.animation} 1s infinite ease-in-out`;
    }
  }, [image.animation]);

  return (
    <div
      ref={imageRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: isSelected ? '2px solid #3b82f6' : 'none',
        cursor: isResizing ? 'nwse-resize' : 'move',
        transform: `rotate(${rotation}deg)`,
        animation: isSpeaking ? `${selectedAnimation} 1s infinite ease-in-out` : 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${image.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: isSpeaking
            ? `${image.animation} 1s infinite ease-in-out`
            : 'none',
        }}
      />
      {isSelected && (
        <>
          <button
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
          >
            <X size={16} />
          </button>
          <button
            className="absolute top-0 left-0 bg-blue-500 text-white p-1 rounded-br"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          >
            {showMenu ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-tl flex items-center justify-center cursor-nwse-resize"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 size={16} color="white" />
          </div>
          <div
            className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-bl flex items-center justify-center cursor-pointer"
            onMouseDown={handleRotateStart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </div>
        </>
      )}
      {showMenu && (
        <div className="absolute top-0 right-full mr-2 bg-white shadow-lg rounded p-2 z-10 flex flex-col w-48">
          <div className="mb-2">
            <h3 className="font-bold mb-1 text-sm text-gray-600">アニメーション</h3>
            {singleLoopAnimations.map((anim) => (
              <button
                key={anim}
                className={`text-left px-2 py-1 hover:bg-gray-100 whitespace-nowrap w-full text-sm capitalize ${
                  selectedAnimation === anim.toLowerCase() ? 'bg-blue-100 font-semibold' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnimationChange(anim.toLowerCase());
                }}
              >
                {anim}
              </button>
            ))}
            <button
              className={`text-left px-2 py-1 hover:bg-gray-100 whitespace-nowrap w-full ${
                isRandomAnimating ? 'bg-blue-100 font-semibold' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleAnimationChange('random');
              }}
            >
              Random
            </button>
          </div>
          <div className="mb-2">
            <h3 className="font-bold mb-1 text-sm text-gray-600">マイクの状態</h3>
            <p className="text-sm mb-1">
              状態: <span className={`${isSpeaking ? 'text-green-600' : 'text-red-600'}`}>
                {isSpeaking ? '話し中' : '待機中'}
              </span>
            </p>
            <button
              className={`text-left px-2 py-1 ${
                recognitionState === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              } hover:bg-gray-100 whitespace-nowrap w-full text-sm font-medium rounded`}
              onClick={(e) => {
                e.stopPropagation();
                if (recognitionState === 'active') {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition();
                }
              }}
            >
              {recognitionState === 'active' ? 'マイク停止' : 'マイク再開'}
            </button>
          </div>
          <button
            className="text-left px-2 py-1 bg-red-500 hover:bg-red-600 text-white whitespace-nowrap w-full mt-2 rounded text-sm font-medium"
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
          >
            画像削除
          </button>
        </div>
      )}
    </div>
  );
};

export default MemeImage;
