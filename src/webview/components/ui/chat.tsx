import React, { memo } from "react";
import Avatar from "./avatar";

interface Message {
    message: string;
    username: string;
    timestamp: Date;
    isUser: boolean;
}

const Chat: React.FC<Message> = memo(({ message, username, timestamp, isUser }) => {
    return (
        <>
            <div className={`flex w-full mb-2 gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && <Avatar username={username} isUser={isUser} />}
                <div className="max-w-[60%]">
                    <div
                        className={`w-full rounded-2xl px-4 py-2 ${
                            isUser
                                ? "bg-[--vscode-activityBarBadge-background] text-[--vscode-activityBar-foreground] rounded-br-none"
                                : "bg-[--vscode-badge-background] text-[--vscode-activityBar-foreground] rounded-bl-none"
                        }`}
                    >
                        <div className="text-wrap min-w-min">{message}</div>
                        <div className={`text-xs mt-1 opacity-70 text-nowrap ${isUser ? "text-right" : "text-left"}`}>
                            {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                    </div>
                </div>
                {isUser && <Avatar username={username} isUser={isUser} />}
            </div>
        </>
    );
});

export default Chat;
export type { Message };
