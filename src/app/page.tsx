import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-y2k-gradient text-black p-4 font-y2k">
      <div className="bg-white y2k-border p-8 rounded-lg">
        <h1 className="text-6xl font-bold mb-6 y2k-text-shadow text-y2k-purple text-center">MemeTuber</h1>
        <p className="text-3xl text-center mb-8 text-y2k-pink">The easiest way to become a VTuber in the world!</p>
        <div className="text-xl text-center mb-12 text-y2k-blue">
          <p>All you need is an image for your avatar!</p>
          <p>Turn your favorite image into a VTuber!</p>
        </div>
        <div className="mb-8 y2k-border overflow-hidden">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/ここにYouTube動画のIDを入れてください"
            title="YouTube動画"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full"
          ></iframe>
        </div>
        <div className="flex justify-center">
          <Link href="/canvas" className="bg-y2k-yellow text-black px-12 py-4 rounded-full text-3xl font-bold hover:bg-opacity-90 transition-colors y2k-border inline-block">
            Let's Get Started!
          </Link>
        </div>
      </div>
    </main>
  );
}
