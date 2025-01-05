
import { LucideIcon } from "lucide-react";
import { Input as ShadcnInput, InputProps as ShadcnInputProps } from "./input";
import { cn } from "../utils";

interface InputIconProps extends ShadcnInputProps {
  Icon: LucideIcon;
}

export const Input = ({ Icon, ...props }: InputIconProps) => {
  return (
    <div className="relative w-auto max-w-sm mr-2">
      <Icon className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2" />
      <ShadcnInput {...props} className={cn(props.className, "pl-8")} />
    </div>
  );
};
