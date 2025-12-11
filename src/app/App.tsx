"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Components
import Transcript from "./components/Transcript";
import BottomToolbar from "./components/BottomToolbar";

// Types & Hooks
import { SessionStatus } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";

// Config
import { defaultCharacter } from "@/app/characters";
import { RealtimeAgent } from "@openai/agents/realtime";

function App() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [userText, setUserText] = useState<string>("");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(true);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // ここでTranscript（字幕）を操作する関数を取得
  const { 
      addTranscriptBreadcrumb, 
      addTranscriptMessage, 
      updateTranscriptMessage 
  } = useTranscript();

  // --- Realtime Session Hook ---
  const {
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    interrupt,
    mute,
  } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
  });

  // --- Audio Element Setup ---
  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  // --- Connection Logic ---
  const fetchEphemeralKey = async (): Promise<string | null> => {
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    if (!data.client_secret?.value) {
      console.error("No ephemeral key provided");
      setSessionStatus("DISCONNECTED");
      return null;
    }
    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) return;

      const initialAgent = new RealtimeAgent({
        name: defaultCharacter.name,
        instructions: defaultCharacter.baseInstructions,
        voice: defaultCharacter.voice,
      });

      await connect({
        getEphemeralKey: async () => EPHEMERAL_KEY,
        initialAgents: [initialAgent],
        audioElement: sdkAudioElement,
        extraContext: { addTranscriptBreadcrumb },
        // ↓ 以下の2行を追加：これで字幕機能と通信機能を接続します
        onMessageCreated: (id, role, text) => addTranscriptMessage(id, role, text),
        onMessageUpdated: (id, text, isDelta) => updateTranscriptMessage(id, text, isDelta),
      });
      
      addTranscriptBreadcrumb(`Agent: ${initialAgent.name}`, initialAgent);

    } catch (err) {
      console.error("Error connecting:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
    } else {
      connectToRealtime();
    }
  };

  // --- Helpers ---
  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    interrupt();
    sendUserText(userText.trim());
    setUserText("");
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== 'CONNECTED') return;
    interrupt();
    setIsPTTUserSpeaking(true);
    sendEvent({ type: 'input_audio_buffer.clear' });
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== 'CONNECTED' || !isPTTUserSpeaking) return;
    setIsPTTUserSpeaking(false);
    sendEvent({ type: 'input_audio_buffer.commit' });
    sendEvent({ type: 'response.create' });
  };

  // --- Effects ---
  useEffect(() => {
      if (sessionStatus === "CONNECTED") {
          const turnDetection = isPTTActive ? null : {
              type: 'server_vad',
              threshold: 0.9,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
              create_response: true,
          };
          sendEvent({
              type: 'session.update',
              session: { turn_detection: turnDetection },
          });
      }
  }, [isPTTActive, sessionStatus]);

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = !isAudioPlaybackEnabled;
      if (isAudioPlaybackEnabled) audioElementRef.current.play().catch(() => {});
    }
    try { mute(!isAudioPlaybackEnabled); } catch {}
  }, [isAudioPlaybackEnabled, sessionStatus]);

  return (
    <div className="text-base flex flex-col h-screen bg-gray-100 text-gray-800 relative">
      <div className="p-5 text-lg font-semibold flex justify-between items-center bg-white border-b">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.reload()}>
          <Image src="/openai-logomark.svg" alt="Logo" width={20} height={20} className="mr-2" />
          <div>Realtime API <span className="text-gray-500">Minimal Template</span></div>
        </div>
      </div>

      <div className="flex flex-1 gap-2 px-2 overflow-hidden relative mt-2">
        <Transcript
          userText={userText}
          setUserText={setUserText}
          onSendMessage={handleSendTextMessage}
          downloadRecording={async () => {}} 
          canSend={sessionStatus === "CONNECTED"}
        />
      </div>

      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={isPTTActive}
        setIsPTTActive={setIsPTTActive}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        isEventsPaneExpanded={false}
        setIsEventsPaneExpanded={() => {}}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        codec="opus"
        onCodecChange={() => {}}
      />
    </div>
  );
}

export default App;