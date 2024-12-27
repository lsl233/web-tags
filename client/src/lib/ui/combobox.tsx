"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/lib/ui/button-loading";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/ui/popover";
import { Badge } from "@/lib/ui/badge";
import { useCommandState } from "cmdk";
import { useCallback, useEffect, useState } from "react";
import { Tag as TagIcon } from "lucide-react";
import { f } from "@/lib/f";

interface CommandSelectProps<T> {
  placeholder?: string;
  value?: string[];
  options?: T[];
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  onCreate?: (name: string) => Promise<T>;
}

export const Combobox = React.forwardRef<HTMLDivElement, CommandSelectProps<any>>(({
  placeholder = "place select",
  value = [],
  onChange = () => { },
  options = [],
  onCreate,
  multiple = true,
  disabled = false,
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [creatingOption, setCreatingOption] = useState(false)
  const [internalValues, setInternalValues] = React.useState<string[]>(value);
  const [commandState, setCommandState] = React.useState({
    search: "",
    count: 0,
  });

  // Handle selection
  const handleSelect = React.useCallback((currentValue: string) => {
    if (!multiple) {
      setInternalValues([currentValue]);
      onChange([currentValue]);
      setOpen(false);
      return
    }
    const newValues = internalValues.includes(currentValue)
      ? internalValues.filter((v) => v !== currentValue)
      : [...internalValues, currentValue];
    setInternalValues(newValues);
    onChange(newValues);
    console.log(newValues, 'new values')
  }, [internalValues, onChange, multiple]);

  const handleStateChange = useCallback((count: number, search: string) => {
    setCommandState({ count, search });
  }, []);

  const handleCreateOption = React.useCallback(async () => {
    try {
      setCreatingOption(true)
      const createdOption = await onCreate?.(commandState.search);
      setInternalValues((prev) => {
        const newValues = [...prev, createdOption.id];
        onChange(newValues);
        return newValues;
      });
      setOpen(false);
    } catch (e) {
      console.error(e)
    } finally {
      setCreatingOption(false)
    }
    
  }, [commandState.search, onCreate, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between h-auto w-full px-3 py-1 min-h-9"
        >
          {internalValues.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {internalValues.map((value) => (
                <Badge variant="outline" key={value}>
                  {
                    options.find((option) => option.id === value)?.name
                  }
                </Badge>
              ))}
            </div>
          ) : (
            <div>{placeholder}</div>
          )}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 max-h-full">
        <Command ref={ref}>
          <CommandInput
            onStateChange={handleStateChange}
            className="h-9"
          />

          <CommandList>
            {
              onCreate ? (
                <CommandEmpty className="p-2">
                  <Button
                    onClick={handleCreateOption}
                    variant="secondary"
                    className="w-full"
                    loading={creatingOption}
                  >
                    <TagIcon className="mr-2 h-4 w-4" />
                    创建“{commandState.search}”标签
                  </Button>
                </CommandEmpty>
              ) : null
            }

            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.id}
                keywords={[option.name]}
                onSelect={handleSelect}
              >
                <div className="flex items-center">
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      internalValues.includes(option.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}) as <T extends { id: string; name: string }>(props: CommandSelectProps<T> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement;

(Combobox as React.FC).displayName = "Combobox";