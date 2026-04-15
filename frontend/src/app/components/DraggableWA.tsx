import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

// Komponen WA Draggable — posisi default kanan bawah
// Bisa digeser ke mana saja, tidak buka WA saat drag
export default function DraggableWA() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  }, [pos]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setHasDragged(true);
    setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setHasDragged(false);
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
  }, [pos]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.mx;
    const dy = t.clientY - dragStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setHasDragged(true);
    setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    e.preventDefault();
  }, [isDragging]);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove]);

  const handleClick = () => {
    if (hasDragged) return;
    window.open(
      'https://wa.me/6281234567890?text=Halo%20DINAS%20ACADEMY,%20saya%20ingin%20bertanya%20tentang%20program%20belajar',
      '_blank'
    );
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={handleClick}
      // ── Posisi default: kanan bawah ──
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-400"
        animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Button */}
      <motion.div
        className="relative w-14 h-14 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full shadow-xl flex items-center justify-center"
        whileHover={!isDragging ? { scale: 1.1 } : {}}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {/* Badge */}
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-white text-[10px] font-bold">1</span>
        </motion.div>
      </motion.div>
    </div>
  );
}