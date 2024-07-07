import Link from 'next/link';
import StartButton from './components/start-button';

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
            src="https://www.youtube.com/embed/2eKPOhVqkPg"
            title="YouTube動画"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full"
          ></iframe>
        </div>
        <div className="flex justify-center">
          <StartButton />
        </div>
        <footer className="mt-12 text-center text-y2k-orange">
          <p>&copy; 2024 MemeTuber. All rights reserved.</p>
          <p>Made with ❤️ by A Project That Cannot Be Named Yet</p>
        </footer>
      </div>
    </main>
  );
}
