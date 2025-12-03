import { cn } from "../../lib/utils";
import * as React from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

const SelectNative = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "peer inline-flex w-full cursor-pointer appearance-none items-center rounded-lg border bg-card text-sm text-foreground shadow-sm shadow-black/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[option[disabled]:checked]:text-muted-foreground hover:border-primary/50",
          props.multiple
            ? "py-1 [&>*]:px-3 [&>*]:py-1 [&_option:checked]:bg-primary [&_option:checked]:text-primary-foreground"
            : "h-9 pe-8 ps-3",
          className
        )}
        ref={ref}
        {...props}>
        {children}
      </select>
      {!props.multiple && (
        <span
          className="pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 peer-disabled:opacity-50">
          <ChevronDownIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
      )}
    </div>
  );
});
SelectNative.displayName = "SelectNative";

export { SelectNative };
