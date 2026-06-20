"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type PendingSubmitButtonProps = React.ComponentProps<typeof Button>;

// A submit button that shows a spinner and disables itself while its parent
// <form> server action is running. Forwards variant/size/className so it can be
// styled like any Button. Use inside a form whose `action` is a server action.
export function PendingSubmitButton({
  children,
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      {...props}
    >
      {pending ? <Spinner className="size-4" /> : children}
    </Button>
  );
}
