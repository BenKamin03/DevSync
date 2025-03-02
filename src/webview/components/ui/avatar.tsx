import React from "react";

interface AvatarProps {
    username: string;
    isUser: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ username, isUser }) => {
    return (
        <div
            className={`mt-auto relative group w-10 h-10 rounded-full font-semibold text-xl flex items-center justify-center ${
                isUser ? "bg-[--vscode-activityBarBadge-background] text-[--vscode-activityBar-foreground]" : "bg-[--vscode-badge-background] text-[--vscode-activityBar-foreground]"
            }`}
        >
            {username
                .split(" ")
                .map((word) => word.charAt(0))
                .slice(0, 3)
                .join("")}

            <div className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 font-light text-xs group-hover:opacity-100 opacity-0 transition-all duration-100">{username}</div>
        </div>
    );
};

export default Avatar;
