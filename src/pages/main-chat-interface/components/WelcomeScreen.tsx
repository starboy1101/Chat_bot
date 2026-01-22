import { useEffect, useState } from "react";
import { WelcomeScreenProps } from "../types";

const WELCOME_MESSAGES = [
  "What’s on your mind today?",
  "What’s on the agenda today?",
  "Ready when you are.",
  "How can I assist you today?",
  "Tell me what you want to get done.",
  "Let’s make something amazing.",
  "I'm here when you need me.",
];

const WelcomeScreen = ({ className = "", input }: WelcomeScreenProps) => {
  const [welcomeText, setWelcomeText] = useState("");

  useEffect(() => {
    const random = Math.floor(Math.random() * WELCOME_MESSAGES.length);
    setWelcomeText(WELCOME_MESSAGES[random]);
  }, []);

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        min-h-[45vh]
        px-2
        ${className}
      `}
    >
      <h1 className="text-2xl font-semibold text-foreground mb-6 text-center">
        {welcomeText}
      </h1>

      {/* ✅ CENTERED INPUT LIVES HERE */}
      {input && (
        <div className="w-full max-w-3xl">
          {input}
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
