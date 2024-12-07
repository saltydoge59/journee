
import BlurIn from "@/components/ui/blur-in";
import { SparklesCore } from "@/components/ui/sparkles";


export default function Home() {
  return (
    <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <BlurIn word="Journee." className="md:text-9xl text-6xl font-bold text-center relative z-20 text-transparent bg-gradient-to-b from-neutral-800 via-white to-white bg-clip-text"/>
      <button className="p-[3px] relative mt-4">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
        <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
          Sign In
        </div>
      </button>
      <a href="#" className="text-gray-400 text-sm mt-3 z-20 hover:underline">Don't have an account?</a>
    </div>
  );
}
