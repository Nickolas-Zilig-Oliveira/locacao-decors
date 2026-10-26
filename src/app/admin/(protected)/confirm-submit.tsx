"use client";

import { useFormStatus } from "react-dom";

type Props = {
  message: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
};

/** Submit button that asks for confirmation before running a destructive form action. */
export function ConfirmSubmit({ message, className, children, ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-label={rest["aria-label"]}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
