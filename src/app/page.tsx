
import { AuroraBackground } from "@/components/ui/aurora-background";
import BlurFade from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
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
        <h1 className="sm:text-9xl text-7xl font-bold text-center relative z-20 text-transparent bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-800 bg-clip-text">Journee.</h1>
      </BlurFade>
      <BlurFade delay={0.25*2} inView className="text-center mt-3">
        <SignInButton>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90 px-8 py-6 text-xl sm:text-2xl sm:py-7">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <a href="sign-up" className="text-gray-400 text-sm z-20 hover:underline text-center block mt-2">Don't have an account?</a>        
        </SignUpButton>
      </BlurFade>
    {/* </div> */}
    </AuroraBackground>
  );
}
