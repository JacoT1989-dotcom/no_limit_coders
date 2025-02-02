import { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

export const Card = ({
  className,
  children,
  ...other
}: ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      className={twMerge(
        "bg-black/40 backdrop-blur-xl rounded-2xl relative z-0 overflow-hidden shadow-xl",
        className,
      )}
      {...other}
    >
      {children}
    </div>
  );
};
