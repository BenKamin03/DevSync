import Chat, { Message } from "../../components/ui/chat";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { messageHandler } from "@estruyf/vscode/dist/client";
import { Textarea } from "../../components/ui/textarea";
import Button from "../../components/ui/button";
import CloseIcon from "../../icons/close";
import { useLocationStore } from "../../stores/location";

const Page = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message && message.command === "MESSAGE") {
                console.log("message", { ...message.data, timestamp: new Date(message.data.timestamp || "") });
                setMessages((prev) => [...prev, { ...message.data, timestamp: new Date(message.data.timestamp || "") }]);
                setTimeout(() => {
                    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
                }, 100);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [messagesRef]);

    useEffect(() => {
        (messageHandler.request("GET_MESSAGES") as Promise<Message[]>).then((messages: Message[]) => {
            if (messages) {
                setMessages(messages);
                messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
            }
        });
    }, [messagesRef]);

    const handleSendMessage = useCallback(() => {
        if (message.trim() === "") return;
        messageHandler.send("SEND_MESSAGE", { message: message.trim() });
        setMessage("");
        setMessages((prev) => [...prev, { message: message.trim(), timestamp: new Date(), username: "You", isUser: true }]);
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }, [message, messagesRef]);

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
            <div className="absolute flex justify-end items-start top-2 right-0 w-full h-12 bg-gradient-to-b from-[#181414] to-transparent z-50">
                <button className="text-white z-50" onClick={disconnect}>
                    <CloseIcon className="z-50" />
                </button>
            </div>

            <div ref={messagesRef} className="flex flex-col pt-8 mt-2 max-h-full overflow-y-auto no-scrollbar">
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
