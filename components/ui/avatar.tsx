"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import clsx from "clsx"

import { cn } from "@/lib/utils"

type AvatarProps = {
  src?: string | null
  initials?: string
  alt?: string
  square?: boolean
  className?: string
  slot?: string
} & React.ComponentProps<typeof AvatarPrimitive.Root>

function Avatar({
  src,
  initials,
  alt = "",
  square = false,
  className,
  slot,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot={slot || "avatar"}
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden",
        square ? "rounded-lg" : "rounded-full",
        className
      )}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square size-full object-cover"
        />
      )}
      {initials && (
        <AvatarPrimitive.Fallback
          className={clsx(
            "flex size-full items-center justify-center bg-zinc-500 text-white text-sm font-medium",
            square ? "rounded-lg" : "rounded-full"
          )}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
