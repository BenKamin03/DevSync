import React, { useCallback, useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import Button from "../components/ui/button";
import Link from "../components/ui/link";
import { messageHandler } from "@estruyf/vscode/dist/client";
import sha256 from "crypto-js/sha256";
import { useLocationStore } from "../stores/location";

import * as vscode from "vscode";

const Page = () => {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string[]>([]);

    useEffect(() => {
        const eventListener = (event: MessageEvent) => {
            if (event.data.command === "CONNECTED") {
                console.log("CONNECTED", event.data.data.connected);
                if (event.data.data.connected) {
                    useLocationStore.getState().navigate("chat");
                }
            }
        };

        window.addEventListener("message", eventListener);

        messageHandler.request("CONNECTED");

        return () => {
            window.removeEventListener("message", eventListener);
        };
    }, []);

    const joinSession = useCallback(() => {
        const errors = [];
        if (!username) {
            errors.push("Username");
        }
        if (!room) {
            errors.push("Room");
        }
        if (!password) {
            errors.push("Password");
        }

        if (errors.length > 0) {
            setError(errors);
            return;
        }

        const uuid = sha256(room + password);
        messageHandler.send("UPDATE_USER", { username });
        messageHandler.send("CONNECT_WS", { wsurl: `ws://localhost:8000/room/${uuid}` });

        useLocationStore.getState().navigate("chat");
    }, [username, room, password]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                joinSession();
            }
        };

        window.addEventListener("keypress", handleKeyPress);

        return () => {
            window.removeEventListener("keypress", handleKeyPress);
        };
    }, [joinSession]);

    return (
        <div className="h-full w-full flex items-center justify-center flex-col gap-4">
            <h1 className="text-center text-2xl font-bold">Welcome to DevSync</h1>
            <div className="flex flex-col gap-2">
                <Input value={username} maxLength={10} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={error.includes("Username") ? "border-red-500" : ""} />
                <Input value={room} maxLength={10} onChange={(e) => setRoom(e.target.value)} placeholder="Room" className={error.includes("Room") ? "border-red-500" : ""} />
                <Input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={error.includes("Password") ? "border-red-500" : ""} />
                <Button variant="secondary" onClick={joinSession}>
                    Join Room
                </Button>
            </div>
        </div>
    );
};

export default Page;
