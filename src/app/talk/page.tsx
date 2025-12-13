"use client";

import React, { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { RealtimeAgent } from '@openai/agents/realtime';
import { characters, defaultCharacter } from '@/app/characters';
import { situationPrompts } from '@/app/situations';

import { SessionStatus } from "@/app/types";
import { TranscriptProvider, useTranscript } from "@/app/contexts/TranscriptContext";
import { useRealtimeSession } from "@/app/hooks/useRealtimeSession";

// 画像のパス設定
const IMAGES = {
  SAD: "/images/sad.png",
  NEUTRAL: "/images/neutral.png",
  HAPPY: "/images/happy.png",
};

// 通話ボタン画像のパス設定
const CALL_IMAGES = {
  START: "/images/start_call.png",
  END: "/images/end_call.png",
};

// シチュエーションと画像の対応マップ
const SITUATION_IMAGE_MAP: Record<string, string> = {
  listening_to_work_complaint: IMAGES.SAD,
  respond_to_lonely_feeling: IMAGES.SAD,
  gentle_check_in: IMAGES.SAD,
  natural_confession_flow: IMAGES.NEUTRAL,
  asking_about_crush: IMAGES.NEUTRAL,
  plan_next_date: IMAGES.HAPPY,
};

// ■ 関係性のプロンプト定義
const RELATIONSHIP_PROMPTS: Record<string, string> = {
  crush: "ユーザーとは「片思い（または友達以上恋人未満）」の関係です。まだ付き合っていませんが、お互いに意識しているような、少し緊張感とドキドキ感のある距離感を演出してください。",
  dating_new: "ユーザーとは「付き合いたて」の関係です。お互いにまだ少し恥じらいがあり、全てが新鮮で楽しい時期です。初々しいカップルのような雰囲気で接してください。",
  dating_long: "ユーザーとは「長く付き合っている」関係です。深い信頼関係があり、言葉が少なくてものんびりできるような、落ち着いた安心感のある雰囲気で接してください。",
};

// ■ 感情表現のプロンプト定義
const EMOTION_PROMPTS: Record<string, string> = {
  reserved: "あなたの感情表現は「控えめ (reserved)」です。感情をストレートに表に出すのが少し苦手か、あるいはクールな性格です。言葉数は少なめで、態度や声のトーンでさりげなく好意や感情を伝えてください。",
  expressive: "あなたの感情表現は「豊か (expressive)」です。嬉しい時は声を弾ませ、悲しい時はシュンとするなど、感情をストレートかつ分かりやすく表現してください。リアクションは大きめでお願いします。",
};

function TalkContent() {
  const searchParams = useSearchParams();

  // 基本パラメータ
  const agentKey = searchParams.get("agent") || "ENTP"; 
  const situationKey = searchParams.get("situation") || "default";
  
  // ■ 新しいユーザー情報パラメータ
  const relationship = searchParams.get("relationship") || "crush"; // crush | dating_new | dating_long
  const emotion = searchParams.get("emotion") || "expressive";     // reserved | expressive
  const interests = searchParams.get("interests") || "特になし";    // 自由記述

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isMuted, setIsMuted] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const { 
      addTranscriptBreadcrumb, 
      addTranscriptMessage, 
      updateTranscriptMessage,
      transcriptItems
  } = useTranscript();

  const {
    connect,
    disconnect,
    mute,
  } = useRealtimeSession({
    onConnectionChange: (s) => {
      setSessionStatus(s as SessionStatus);
      if (s === "DISCONNECTED") setIsMuted(false);
    },
  });

  const sdkAudioElement = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement) {
      document.body.appendChild(sdkAudioElement);
      audioElementRef.current = sdkAudioElement;
    }
    return () => {
      if (sdkAudioElement) sdkAudioElement.remove();
    };
  }, [sdkAudioElement]);

  const toggleConnection = async () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnect();
      return;
    }

    setSessionStatus("CONNECTING");

    try {
      const tokenResponse = await fetch("/api/session");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret?.value;
      if (!EPHEMERAL_KEY) {
        setSessionStatus("DISCONNECTED");
        return;
      }

      const charData = characters[agentKey] || defaultCharacter;
      const situationInstruction = situationPrompts[situationKey] || situationPrompts["default"];

      // ■ プロンプトの組み立て
      const relationshipInstruction = RELATIONSHIP_PROMPTS[relationship] || RELATIONSHIP_PROMPTS["crush"];
      const emotionInstruction = EMOTION_PROMPTS[emotion] || EMOTION_PROMPTS["expressive"];

      const finalInstructions = `
        ${charData.baseInstructions}
        
        --- 現在のシチュエーション ---
        ${situationInstruction}

        --- ユーザーとの関係性と性格設定 ---
        【関係性】: ${relationshipInstruction}
        【感情表現】: ${emotionInstruction}
        【ユーザーの趣味・関心】: ${interests}
        (会話の中で、ユーザーの趣味・関心に関連する話題があれば、自然に触れて話を広げてください)

        --- 会話のルール ---
        あなたは上記のキャラクターになりきり、電話越しに話しているように自然に振る舞ってください。
        ユーザーが話し終わるのを待ってから応答してください（VADモード）。
        発言の長さは、短く30文字以内で、テンポの良い会話を意識してください。
      `;

      console.log("Generated Instructions:", finalInstructions);

      const dynamicAgent = new RealtimeAgent({
        name: charData.name,
        voice: charData.voice,
        instructions: finalInstructions,
      });

      await connect({
        getEphemeralKey: async () => EPHEMERAL_KEY,
        initialAgents: [dynamicAgent],
        audioElement: sdkAudioElement,
        extraContext: { addTranscriptBreadcrumb },
        onMessageCreated: (id, role, text) => addTranscriptMessage(id, role, text),
        onMessageUpdated: (id, text, isDelta) => updateTranscriptMessage(id, text, isDelta),
      });
      
      addTranscriptBreadcrumb(`Agent: ${charData.name}`, dynamicAgent);

    } catch (err) {
      console.error("Error connecting:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    mute(nextState);
  };

  const currentImage = SITUATION_IMAGE_MAP[situationKey] || IMAGES.NEUTRAL;
  const latestAgentMsg = [...transcriptItems].reverse().find(
    item => item.role === 'assistant' && item.type === 'MESSAGE'
  );
  const latestUserMsg = [...transcriptItems].reverse().find(
    item => item.role === 'user' && item.type === 'MESSAGE'
  );

  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 text-gray-800 font-sans">
      
      {/* 背景・キャラクター画像 */}
      <div className="absolute inset-0 z-0">
        <Image src={currentImage} alt="Character" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* ヘッダー */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <Link href="/" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-2 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="text-white font-bold text-lg drop-shadow-md tracking-wide">
          {agentKey.toUpperCase()}
        </span>
        <div className="w-10"></div>
      </div>

      {/* AIのセリフエリア */}
      <div className="absolute top-24 left-4 right-4 z-10 flex justify-center">
        {latestAgentMsg && (
          <div className="relative bg-white border-2 border-gray-800 rounded-2xl p-5 max-w-md shadow-xl animate-fade-in-up">
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-gray-800"></div>
            <div className="absolute -bottom-[9px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white"></div>
            <p className="text-gray-900 font-bold text-lg leading-relaxed whitespace-pre-wrap">
              {latestAgentMsg.title}
            </p>
          </div>
        )}
      </div>

      {/* ユーザーのセリフエリア */}
      <div className="absolute bottom-44 left-4 right-4 z-10">
         <div className="bg-white/95 border-2 border-gray-800 rounded-xl p-4 min-h-[80px] shadow-lg flex items-center justify-center text-center">
            <p className="text-gray-800 font-medium text-lg">
              {latestUserMsg ? latestUserMsg.title : 
               isConnected ? (isMuted ? "（マイクオフ中）" : "（話しかけてください...）") : "（通話ボタンを押して開始）"}
            </p>
         </div>
      </div>

      {/* コントロールエリア */}
      <div className="absolute bottom-0 left-0 w-full z-30 pb-10 pt-4 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center gap-8">
        
        {/* ミュートボタン（接続中のみ表示） */}
        {isConnected && (
          <button
            onClick={toggleMute}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 border border-white/20 shadow-lg
              ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-800/60 text-white hover:bg-gray-700/60'}
            `}
          >
            {isMuted ? (
              // マイクオフ
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            ) : (
              // マイクオン
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
        )}

        {/* 通話開始/終了ボタン */}
        <button
          onClick={toggleConnection}
          disabled={isConnecting}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform
            ${isConnecting ? 'opacity-50 cursor-wait scale-95' : 'hover:scale-110 active:scale-95 drop-shadow-2xl'}
          `}
        >
           <Image 
             src={isConnected ? CALL_IMAGES.END : CALL_IMAGES.START}
             alt={isConnected ? "End Call" : "Start Call"}
             width={100}
             height={100}
             className="w-full h-full object-contain"
             priority
           />
        </button>

        {/* 右側のバランス用スペース */}
        {isConnected && <div className="w-16" />} 

      </div>
    </div>
  );
}

export default function TalkPage() {
  return (
    <Suspense fallback={<div className="bg-black h-screen text-white flex items-center justify-center">Loading...</div>}>
      <TranscriptProvider>
        <TalkContent />
      </TranscriptProvider>
    </Suspense>
  );
}