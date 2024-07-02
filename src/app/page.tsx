import Image from "next/image";
import Animator from './components/animator';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <Animator className="absolute inset-0 w-full h-full" />
    </main>
  );
}
