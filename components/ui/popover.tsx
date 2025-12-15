"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  className,
  ...props
}: PopoverPrimitive.Trigger.Props & { className?: string }) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={className}
      {...props}
    />
  );
}

function PopoverContent({
  className,
  sideOffset = 4,
  children,
  matchTriggerWidth = false,
  ...props
}: PopoverPrimitive.Popup.Props & {
  sideOffset?: number;
  matchTriggerWidth?: boolean;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        sideOffset={sideOffset}
        className={matchTriggerWidth ? "w-[var(--anchor-width)]" : undefined}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 rounded-md border p-4 shadow-md outline-hidden",
            matchTriggerWidth ? "w-full" : "w-72",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  className,
  ...props
}: PopoverPrimitive.Anchor.Props & { className?: string }) {
  return (
    <PopoverPrimitive.Anchor
      data-slot="popover-anchor"
      className={className}
      {...props}
    />
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
