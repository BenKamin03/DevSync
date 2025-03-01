import React, { useState } from "react";
import { Input } from "../components/ui/input";
import Button from "../components/ui/button";
import Link from "../components/ui/link";
const Page = () => {
    const [sessionID, setSessionID] = useState("");

    return (
        <div className="h-full w-full flex items-center justify-center flex-col">
            <h1 className="text-center text-2xl font-bold mb-4">Welcome to DevSync</h1>
            <Link
                href="/join"
                onClick={() => {
                    window.location.href = "/join";
                }}
            >
                <Button>Join a session</Button>
            </Link>
        </div>
    );
};

export default Page;
