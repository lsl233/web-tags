import React, { lazy, Suspense } from "react";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/ui/popover";
import { Button } from "./button";

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

export type IconName = keyof typeof dynamicIconImports;


export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

export const AsyncIcon = ({ name, ...props }: IconProps) => {
  const LucideIcon = lazy(dynamicIconImports[name]);

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

// TODO: 加载更多Icon、以及优化
export const IconPicker: React.FC<{ children: React.ReactNode, value: IconName, onChange: (name: IconName) => void }> = ({ children, value, onChange }) => {
  const IconComponentNames: IconName[] = [
    "apple",
    "badge-info",
    "banana",
    "book-check",
    "shield-alert",
    "shield-check",
    "shield-off",
    "shield-x",
    "shield-plus",
    "shield-minus",
    "shield-x",
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="p-4">
        <div className="w-auto grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2">
          {IconComponentNames.map((name) => (
            <Button key={name} variant="ghost" size="icon" onClick={() => onChange(name)}>
              <AsyncIcon name={name} />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
