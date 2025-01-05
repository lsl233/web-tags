import React, {
  lazy,
  memo,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import { LucideProps, Mail, Search } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/ui/popover";
import { Button } from "./button";
import { areEqual, FixedSizeGrid } from "react-window";
import { Input } from "./input-icon";
import { cn, debounce } from "../utils";
import { Separator } from "./separator";

const fallback = <div className="w-[24px] h-[24px]" />;

export type IconName = keyof typeof dynamicIconImports;

export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

export const AsyncIcon = ({ name, ...props }: IconProps) => {
  const LucideIcon = useMemo(() => lazy(dynamicIconImports[name]), [name]);

  return (
    <Suspense fallback={<div className={cn('bg-slate-300', props.className)} />}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

export const IconButton = memo(
  ({
    iconName,
    isSelected,
    style,
    onChange,
  }: {
    iconName: IconName;
    isSelected: boolean;
    style: React.CSSProperties;
    onChange: (name: IconName) => void;
  }) => (
    <Button
      style={style}
      type="button"
      variant={isSelected ? "secondary" : "ghost"}
      size="icon"
      onClick={() => onChange(iconName)}
    >
      <AsyncIcon name={iconName} />
    </Button>
  )
);

const IconPickerContent = memo(
  ({
    data,
    columnIndex,
    rowIndex,
    style,
  }: {
    data: {
      filteredIconComponentNames: IconName[];
      onChange: (name: IconName) => void;
    };
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const { filteredIconComponentNames, onChange } = data;
    const handleChange = useCallback(
      (name: IconName) => {
        onChange(name);
      },
      [onChange]
    );
    const index = rowIndex * 8 + columnIndex;
    if (index >= filteredIconComponentNames.length) {
      return null;
    }

    const iconName = filteredIconComponentNames[index];

    return (
      <IconButton
        iconName={iconName}
        isSelected={false}
        style={style}
        onChange={handleChange}
      />
    );
  },
  areEqual
);

const iconComponentNames = Object.keys(dynamicIconImports) as IconName[];

export const IconPicker: React.FC<{
  children: React.ReactNode;
  onChange: (name: IconName) => void;
}> = ({ children, onChange }) => {
  const [keyword, setKeyword] = useState("");
  const filteredIconComponentNames = useMemo(
    () => iconComponentNames.filter((name) => name.includes(keyword)),
    [keyword]
  );


  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="py-2 pl-2 pr-0 w-auto">
        <Input
          onChange={debounce((e) => setKeyword(e.target.value), 300)}
          Icon={Search}
        />
        <Separator className="mt-2 mb-1" />
        <FixedSizeGrid
          height={300}
          columnCount={8}
          columnWidth={36}
          rowHeight={36}
          rowCount={Math.ceil(iconComponentNames.length / 8)}
          width={36 * 8 + 12}
          itemData={{
            filteredIconComponentNames,
            onChange,
          }}
        >
          {IconPickerContent}
        </FixedSizeGrid>
      </PopoverContent>
    </Popover>
  );
};
