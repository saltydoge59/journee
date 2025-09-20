import RingLoader from "react-spinners/ClipLoader";
import { useToast } from "@/hooks/use-toast";

interface LoadingToastProps {
  title: string;
  color?: string;
}

export default function LoadingToast({ title, color = "green" }: LoadingToastProps) {
  const { toast } = useToast();

  const showLoadingToast = () => {
    toast({
      title,
      action: <RingLoader loading={true} color={color} />
    });
  };

  return { showLoadingToast };
}