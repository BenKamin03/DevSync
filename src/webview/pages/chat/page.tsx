import Chat, { Message } from "../../components/ui/chat";
import React, { useState, useEffect, useCallback } from "react";
import { messageHandler } from "@estruyf/vscode/dist/client";
import { Textarea } from "../../components/ui/textarea";
import Button from "../../components/ui/button";
import CloseIcon from "../../icons/close";
import { useLocationStore } from "../../stores/location";

const Page = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message && message.command === "MESSAGE") {
                console.log("message", { ...message.data, timestamp: new Date(message.data.timestamp || "") });
                setMessages((prev) => [...prev, { ...message.data, timestamp: new Date(message.data.timestamp || "") }]);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    useEffect(() => {
        (messageHandler.request("GET_MESSAGES") as Promise<Message[]>).then((messages: Message[]) => {
            if (messages) setMessages(messages);
        });
    }, []);

    const handleSendMessage = useCallback(() => {
        messageHandler.send("SEND_MESSAGE", { message });
        setMessage("");
        setMessages((prev) => [...prev, { message, timestamp: new Date(), username: "You", isUser: true }]);
    }, [message]);

    useEffect(() => {
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey && isFocused) {
                e.preventDefault();
                handleSendMessage();
            }
        };
        window.addEventListener("keydown", handleEnter);
        return () => {
            window.removeEventListener("keydown", handleEnter);
        };
    }, [isFocused, handleSendMessage]);

    const disconnect = useCallback(() => {
        messageHandler.send("DISCONNECT");
        useLocationStore.getState().navigate("");
    }, []);

    return (
        <div className="flex flex-col gap-4 h-full w-full justify-between relative">
            <button className="absolute top-2 right-0 text-white" onClick={disconnect}>
                <CloseIcon />
            </button>
            <div className="flex flex-col mt-12">
                {messages.map((message, index) => (
                    <Chat key={index} {...message} />
                ))}
            </div>
            <div className="mb-4">
                <Textarea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} style={{ resize: "none" }} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
        </div>
    );
};

export default Page;
