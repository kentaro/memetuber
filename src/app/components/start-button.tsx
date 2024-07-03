'use client';

import Link from 'next/link';

export default function StartButton() {
  return (
    <Link
      href="/canvas"
      className="bg-y2k-yellow text-black px-12 py-4 rounded-full text-3xl font-bold hover:bg-opacity-90 transition-colors y2k-border inline-block"
      onClick={(e) => {
        e.preventDefault();
        window.open('/canvas', '_blank', 'width=960,height=540,menubar=no,toolbar=no,location=no,status=no,innerWidth=960,innerHeight=540');
      }}
    >
      始めましょう！
    </Link>
  );
}
