import { SignIn } from "@clerk/react";
import BlurFade from "@/components/ui/blur-fade";

export default function SignInPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <BlurFade delay={0.25} inView>
        <SignIn
          routing="path"
          path="/sign-in"
          appearance={{
            variables: {
              colorPrimary: "hsl(150, 28%, 20%)",
              colorBackground: "hsl(40, 42%, 96%)",
              colorForeground: "hsl(30, 22%, 14%)",
              colorMutedForeground: "hsl(32, 15%, 40%)",
              colorInput: "hsl(40, 42%, 96%)",
              colorInputForeground: "hsl(30, 22%, 14%)",
              borderRadius: "0.25rem",
            },
          }}
        />
      </BlurFade>
    </div>
  );
}
