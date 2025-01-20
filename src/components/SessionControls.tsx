import { useState } from "react";
import { CloudLightning, CloudOff } from "react-feather";
import Button from "./Button";

interface SessionStoppedProps {
    startSession: () => void;
}

function SessionStopped({ startSession }: SessionStoppedProps) {
    const [isActivating, setIsActivating] = useState(false);

    function handleStartSession() {
        if (isActivating) return;

        setIsActivating(true);
        startSession();
    }

    return (
        <div className="flex items-center justify-center w-full h-full">
            <Button
                onClick={handleStartSession}
                className={isActivating ? "bg-gray-600" : "bg-red-600"}
                icon={<CloudLightning height={16} />}
            >
                {isActivating ? "starting session..." : "start session"}
            </Button>
        </div>
    );
}

interface SessionActiveProps {
    stopSession: () => void;
}

function SessionActive({ stopSession }: SessionActiveProps) {


    return (
        <div className="flex items-center justify-center w-full h-full gap-4">
            <Button onClick={stopSession} icon={<CloudOff height={16} />}>
                disconnect
            </Button>
        </div>
    );
}

interface SessionControlsProps {
    startSession: () => void;
    stopSession: () => void;
    isSessionActive: boolean;
}

export default function SessionControls({
                                            startSession,
                                            stopSession,
                                            isSessionActive,
                                        }: SessionControlsProps) {
    return (
        <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
            {isSessionActive ? (
                <SessionActive
                    stopSession={stopSession}
                />
            ) : (
                <SessionStopped startSession={startSession} />
            )}
        </div>
    );
}