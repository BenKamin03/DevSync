import React from "react";

interface ButtonProps extends React.ComponentProps<"button"> {
    variant?: "primary" | "secondary";
}

const Button = ({ children, variant = "primary", ...props }: ButtonProps) => {
    return (
        <button
            {...props}
            className={`${
                variant === "primary"
                    ? "bg-input-background text-input-foreground outline outline-1 outline-input-border"
                    : "bg-[--vscode-activityBar-dropBorder] text-black outline outline-1 outline-input-border"
            } px-4 py-2 rounded-md active:scale-95 transition-all duration-100 ${props.className}`}
        >
            {children}
        </button>
    );
};

export default Button;
