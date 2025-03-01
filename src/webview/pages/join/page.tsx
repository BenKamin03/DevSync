import React, { useState } from "react";
import { Input } from "../../components/ui/input";
import Button from "../../components/ui/button";

const Page = () => {
    const [sessionID, setSessionID] = useState("");

    return (
        <div className="h-full w-full flex items-center justify-center flex-col relative">
            <p className="text-center text-sm text-muted-foreground">Enter your Session ID to continue</p>
            <Input value={sessionID} onChange={(e) => setSessionID(e.target.value)} />
            <Button variant="secondary" className="mt-4">
                Join
            </Button>
        </div>
    );
};

export default Page;
