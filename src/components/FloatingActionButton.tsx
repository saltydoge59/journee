import { Link } from "react-router-dom";
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

  const baseClasses = `${positionClasses[position]} h-14 w-14 rounded-full bg-[hsl(var(--seal))] text-[hsl(var(--seal-foreground))] text-2xl font-semibold shadow-lg transition-transform hover:scale-105 flex items-center justify-center ${!visible ? "hidden" : ""} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        <Link to={href}>
          {children}
        </Link>
      </button>
    );
  }

  return (
    <Link to={href} className={baseClasses}>
      {children}
    </Link>
  );
}