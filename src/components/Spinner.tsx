import { HTMLAttributes } from "react";

function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <span
      className={`spinner-border spinner-border-sm text-primary ${className}`}
      role="status"
      {...props}
    >
      <span className="visually-hidden">Loading...</span>
    </span>
  );
}

export default Spinner;
