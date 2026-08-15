
import BlurFade from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";


export default function Landing() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-6">
      <BlurFade delay={0.25} inView>
        <h1 className="text-center font-serif-display text-7xl italic text-foreground sm:text-9xl">Journee</h1>
      </BlurFade>
      <BlurFade delay={0.25*2} inView className="mt-6 text-center">
        <SignInButton>
          <Button className="font-mono-label rounded-sm bg-primary px-8 py-6 text-sm uppercase text-primary-foreground hover:brightness-95 sm:text-base sm:py-7">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <a href="sign-up" className="font-mono-label z-20 mt-3 block text-center text-xs uppercase text-muted-foreground hover:text-foreground hover:underline">Don&apos;t have an account?</a>
        </SignUpButton>
      </BlurFade>
    </div>
  );
}
