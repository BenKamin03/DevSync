import React, { useCallback, useState } from "react";
import { Input } from "../components/ui/input";
import Button from "../components/ui/button";
import Link from "../components/ui/link";
import { messageHandler } from "@estruyf/vscode/dist/client";
import { v4 as uuidv4 } from "uuid";

import * as vscode from "vscode";

const Page = () => {
    const [sessionID, setSessionID] = useState("");

    const createSession = useCallback(() => {
        const uuid = "test-room"; //uuidv4();
        messageHandler.send("CONNECT_WS", { wsurl: `ws://localhost:8000/room/${uuid}` });
    }, []);

    return (
        <div className="h-full w-full flex items-center justify-center flex-col gap-4">
            <h1 className="text-center text-2xl font-bold">Welcome to DevSync</h1>
            <div className="flex gap-2">
                <Link
                    href="/join"
                    onClick={() => {
                        window.location.href = "/join";
                    }}
                >
                    <Button>Join a session</Button>
                </Link>
                <Button variant="secondary" onClick={createSession}>
                    Create a session
                </Button>
            </div>
        </div>
    );
};

export default Page;
