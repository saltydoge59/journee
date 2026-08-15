import { SignUp } from '@clerk/nextjs';
import BlurFade from "@/components/ui/blur-fade";

export default function Page() {
    return <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <BlurFade delay={0.25} inView>
                <SignUp
                  appearance={{
                    variables: {
                      colorPrimary: "hsl(150, 28%, 20%)",
                      colorBackground: "hsl(40, 42%, 96%)",
                      colorText: "hsl(30, 22%, 14%)",
                      colorTextSecondary: "hsl(32, 15%, 40%)",
                      colorInputBackground: "hsl(40, 42%, 96%)",
                      colorInputText: "hsl(30, 22%, 14%)",
                      borderRadius: "0.25rem",
                    },
                  }}
                />
            </BlurFade>
        </div>
}
