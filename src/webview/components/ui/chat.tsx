import React, { memo } from "react";

interface Message {
    message: string;
    username: string;
    timestamp: Date;
    isUser: boolean;
}

const Chat: React.FC<Message> = memo(({ message, username, timestamp, isUser }) => {
    return (
        <div className={`flex w-full mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isUser
                        ? "bg-[--vscode-activityBarBadge-background] text-[--vscode-activityBar-foreground] rounded-tr-none"
                        : "bg-[--vscode-badge-background] text-[--vscode-activityBar-foreground] rounded-tl-none"
                }`}
            >
                {!isUser && <div className="font-semibold text-sm mb-1">{username}</div>}
                <div>{message}</div>
                <div className="text-xs mt-1 opacity-70">{timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
        </div>
    );
});

export default Chat;
export type { Message };
