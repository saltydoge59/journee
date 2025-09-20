import Link from "next/link";
import { ReactNode } from "react";

interface FloatingActionButtonProps {
  href: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  position?: "bottom-right" | "bottom-left";
  visible?: boolean;
}

export default function FloatingActionButton({
  href,
  onClick,
  children,
  className = "",
  position = "bottom-right",
  visible = true
}: FloatingActionButtonProps) {
  const positionClasses = {
    "bottom-right": "fixed bottom-16 sm:bottom-3 right-2 sm:right-6",
    "bottom-left": "fixed bottom-16 sm:bottom-3 left-2 sm:left-6"
  };

  const baseClasses = `${positionClasses[position]} px-5 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-3xl font-bold text-white tracking-widest transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200 flex items-center justify-center ${!visible ? "hidden" : ""} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        <Link href={href}>
          {children}
        </Link>
      </button>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {children}
    </Link>
  );
}