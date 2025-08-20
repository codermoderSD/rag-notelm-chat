// Shadcn Select component wrapper using Radix UI
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value
export const SelectTrigger = React.forwardRef(
    (
        { className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { className?: string },
        ref: React.ForwardedRef<HTMLButtonElement>
    ) => (
        <SelectPrimitive.Trigger
            ref={ref}
            className={"flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50" + (className || "")}
            {...props}
        />
    )
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectContent = React.forwardRef(
    (
        { className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { className?: string },
        ref: React.ForwardedRef<HTMLDivElement>
    ) => (
        <SelectPrimitive.Content
            ref={ref}
            className={"z-50 min-w-[8rem] overflow-hidden rounded-md border border-input bg-popover text-popover-foreground shadow-md animate-in fade-in-80" + (className || "")}
            {...props}
        />
    )
)
SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectItem = React.forwardRef(
    (
        { className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { className?: string },
        ref: React.ForwardedRef<HTMLDivElement>
    ) => (
        <SelectPrimitive.Item
            ref={ref}
            className={"relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" + (className || "")}
            {...props}
        />
    )
)
SelectItem.displayName = SelectPrimitive.Item.displayName

export const SelectLabel = SelectPrimitive.Label
export const SelectSeparator = SelectPrimitive.Separator
export const SelectArrow = SelectPrimitive.Arrow
