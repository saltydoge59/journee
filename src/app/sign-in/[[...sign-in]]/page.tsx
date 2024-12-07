import { SignIn } from '@clerk/nextjs'
import { SparklesCore } from "@/components/ui/sparkles";
import BlurFade from "@/components/ui/blur-fade";

export default function Page() {
  return <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden">
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
            <BlurFade delay={0.25} inView>
                <SignIn/>
            </BlurFade>
        </div>
}