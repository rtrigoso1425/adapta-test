import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { useDebounce } from "../../hooks/use-debounce";
import { useTheme } from "../../components/theme-provider";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Input } from "../../components/ui/input";
import { color } from "framer-motion";

export function AsyncSelect(
  {
    fetcher,
    preload,
    filterFn,
    renderOption,
    getOptionValue,
    getDisplayValue,
    notFound,
    loadingSkeleton,
    label,
    placeholder = "Select...",
    value,
    onChange,
    disabled = false,
    width = "200px",
    className,
    triggerClassName,
    noResultsMessage,
    clearable = true
  }
) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300);
  const [originalOptions, setOriginalOptions] = useState([]);
 
  useEffect(() => {
    setMounted(true);
    setSelectedValue(value);
  }, [value]);
 
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetcher(debouncedSearchTerm);
        setOriginalOptions(data);
        setOptions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
      }
    };

    if (preload && !mounted) {
      fetchOptions();
    } 
    else if (!preload && debouncedSearchTerm) {
      fetchOptions();
    } 
    else if (preload && mounted) {
      if (debouncedSearchTerm) {
        setOptions(
          originalOptions.filter((option) => filterFn ? filterFn(option, debouncedSearchTerm) : true)
        );
      } else {
        setOptions(originalOptions);
      }
    }
  }, [fetcher, debouncedSearchTerm, mounted, preload, filterFn]);
 
  const handleSelect = useCallback((currentValue) => {
    const newValue = clearable && currentValue === selectedValue ? "" : currentValue;
    setSelectedValue(newValue);
    setSelectedOption(options.find((option) => getOptionValue(option) === newValue) || null);
    onChange(newValue);
    setOpen(false);
  }, [selectedValue, onChange, clearable, options, getOptionValue]);
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-auto py-2",
            "bg-white dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
          style={{ 
            width: width, 
            color: isDark ? "#e0e0e0" : "#000000"
          }}
          disabled={disabled}>
          {selectedOption ? (
            getDisplayValue(selectedOption)
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-sm">{placeholder}</span>
          )}
          <ChevronsUpDown className="opacity-50 dark:opacity-60" size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="start"
        className={cn(
          "p-0",
          "bg-white dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          className
        )}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command className="bg-white dark:bg-gray-800">
          <div className={cn(
            "relative border-b w-full",
            "bg-white dark:bg-gray-800",
            "border-gray-200 dark:border-gray-700"
          )}>
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder={`Busca tu ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "focus-visible:ring-0 rounded-b-none border-none pl-8 flex-1 w-full",
                "bg-white dark:bg-gray-800",
                "text-black dark:text-white",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400"
              )} />
            {loading && options.length > 0 && (
              <div
                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
          <CommandList className="bg-white dark:bg-gray-800">
            {error && (
              <div className="p-4 text-destructive text-center">
                {error}
              </div>
            )}
            {loading && options.length === 0 && (
              loadingSkeleton || <DefaultLoadingSkeleton isDark={isDark} />
            )}
            {!loading && !error && options.length === 0 && (
              notFound || <CommandEmpty className="text-gray-600 dark:text-gray-400">{noResultsMessage ?? `No se encontro ninguna ${label.toLowerCase()}.`}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                  onSelect={handleSelect}
                  className={cn(
                    "w-full cursor-pointer px-0",
                    "text-black dark:text-white",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "focus:bg-gray-100 dark:focus:bg-gray-700"
                  )}>
                  <div className="flex items-center justify-between w-full px-2">
                    {renderOption(option)}
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3 flex-shrink-0",
                        "text-black dark:text-white",
                        selectedValue === getOptionValue(option) ? "opacity-100" : "opacity-0"
                      )} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton({ isDark }) {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className={cn(
              "h-6 w-6 rounded-full animate-pulse",
              "bg-gray-300 dark:bg-gray-600"
            )} />
            <div className="flex flex-col flex-1 gap-1">
              <div className={cn(
                "h-4 w-24 animate-pulse rounded",
                "bg-gray-300 dark:bg-gray-600"
              )} />
              <div className={cn(
                "h-3 w-16 animate-pulse rounded",
                "bg-gray-300 dark:bg-gray-600"
              )} />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}