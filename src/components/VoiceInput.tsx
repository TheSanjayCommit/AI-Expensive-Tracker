"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  isProcessing?: boolean;
}

export function VoiceInput({ onTranscriptComplete, isProcessing = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.warn("Speech recognition not supported in this browser.");
      }
    }
  }, []);

  useEffect(() => {
    if (!isListening && transcript && recognition) {
      // Small delay to allow user to see final transcript before processing
      const timeout = setTimeout(() => {
        onTranscriptComplete(transcript);
        setTranscript("");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isListening, transcript, onTranscriptComplete, recognition]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  }, [isListening, recognition]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-lg mx-auto p-6 glass rounded-3xl dark:glass-dark transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary-500/30"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-300 \${
            isListening 
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/50" 
              : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/50"
          } \${isProcessing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
        >
          {isProcessing ? (
             <Loader2 className="h-8 w-8 animate-spin" />
          ) : isListening ? (
             <MicOff className="h-8 w-8" />
          ) : (
             <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      <div className="text-center space-y-2 min-h-[4rem]">
        <h3 className="text-lg font-medium text-foreground">
          {isProcessing 
            ? "Analyzing expense..." 
            : isListening 
              ? "Listening..." 
              : "Tap to record an expense"}
        </h3>
        <p className="text-sm text-foreground/70 min-h-[1.25rem]">
           {transcript || (!isListening && !isProcessing && "e.g., 'Spent $25 on lunch at Subway'")}
        </p>
      </div>
    </div>
  );
}
