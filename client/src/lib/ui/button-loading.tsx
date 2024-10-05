import { Loader2 } from "lucide-react";
import {
  ButtonProps as ShadcnButtonProps,
  Button as ShadcnButton,
} from "./button";
import { cn } from "../utils";
export interface ButtonProps extends ShadcnButtonProps {
  loading?: boolean;
}

export const Button = ({
  children,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <ShadcnButton
      {...props}
      className={cn(className, loading && "relative")}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <span className={cn(loading && "opacity-0")}>{children}</span>
        </>
      ) : (
        children
      )}
    </ShadcnButton>
  );
};
