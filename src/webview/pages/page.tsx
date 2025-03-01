import React, { useState } from "react";
import { Input } from "../components/ui/input";
import Button from "../components/ui/button";
import Link from "../components/ui/link";
const Page = () => {
    const [sessionID, setSessionID] = useState("");

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
                <Button variant="secondary">Create a session</Button>
            </div>
        </div>
    );
};

export default Page;
