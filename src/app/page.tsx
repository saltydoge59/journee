
import { AuroraBackground } from "@/components/ui/aurora-background";
import BlurFade from "@/components/ui/blur-fade";
import { SparklesCore } from "@/components/ui/sparkles";
import { SignInButton, SignUpButton } from "@clerk/nextjs";


export default function Landing() {
  return (
    <AuroraBackground className="h-screen w-full relative">
    {/* <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden">
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
      </div> */}
      <BlurFade delay={0.25} inView>
        <h1 className="md:text-9xl text-7xl font-bold text-center relative z-20 text-transparent bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-800 bg-clip-text">Journee.</h1>
      </BlurFade>
      <BlurFade delay={0.25*2} inView>
        <SignInButton>
          <button className="p-[3px] relative mt-4 block mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
            <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent md:text-2xl text-md">
              Sign In
            </div>
          </button>
        </SignInButton>
        <SignUpButton>
          <a href="sign-up" className="text-gray-400 text-sm z-20 hover:underline text-center block mt-3">Don't have an account?</a>        
        </SignUpButton>
      </BlurFade>
    {/* </div> */}
    </AuroraBackground>
  );
}
