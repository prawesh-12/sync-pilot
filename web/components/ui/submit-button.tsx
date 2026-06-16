"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ctaButtonTheme } from "@/components/cta-button-class";
import { cn } from "@/lib/utils";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({
  children,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={cn(ctaButtonTheme, className)}
      {...props}
    >
      {pending ? <Spinner className="size-4" /> : children}
    </Button>
  );
}
