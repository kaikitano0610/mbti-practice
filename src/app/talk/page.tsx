"use client";

import React, { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { RealtimeAgent } from '@openai/agents/realtime';
import { characters, defaultCharacter } from '@/app/characters';
import { situationPrompts } from '@/app/situations';

import { SessionStatus } from "@/app/types";
import { TranscriptProvider, useTranscript } from "@/app/contexts/TranscriptContext";
import { useRealtimeSession } from "@/app/hooks/useRealtimeSession";

// 画像パス設定
const IMAGES = {
  SAD: "/images/sad.png",
  NEUTRAL: "/images/neutral.png",
  HAPPY: "/images/happy.png",
};
const CALL_IMAGES = {
  START: "/images/start_call.png",
  END: "/images/end_call.png",
};
const SITUATION_IMAGE_MAP: Record<string, string> = {
  listening_to_work_complaint: IMAGES.SAD,
  respond_to_lonely_feeling: IMAGES.SAD,
  gentle_check_in: IMAGES.SAD,
  natural_confession_flow: IMAGES.NEUTRAL,
  asking_about_crush: IMAGES.NEUTRAL,
  plan_next_date: IMAGES.HAPPY,
};
const RELATIONSHIP_PROMPTS: Record<string, string> = {
  crush: `
    ユーザーとは「友達以上恋人未満（片思い）」の関係です。まだ正式には付き合っていません。
    お互いに意識はしていますが、決定的な言葉は交わしていません。
    
    【重要: 距離感のルール】
    まだ恋人ではないため、過度なスキンシップ（ハグやキス）や、あまりに甘すぎる言葉に対しては、
    「えっ、まだ付き合ってないでしょ？」「ちょ、距離近くない？」と動揺したり、照れ隠しで茶化したりして、
    **簡単には受け入れないでください。**
    この「付き合えそうで付き合えないもどかしさ」や「緊張感」を演出してください。
  `,

  dating_new: `
    ユーザーとは「付き合いたて」のカップルです。
    お互いにまだ「彼氏・彼女」という呼び名に慣れておらず、全てが新鮮でドキドキする時期です。
    
    【重要: 距離感のルール】
    好きという気持ちは全開ですが、スキンシップや甘い言葉には慣れていません。
    「好き」「ハグしたい」と言われたら、嬉しそうにしつつも、顔を赤らめたり、
    「恥ずかしいから...」とモジモジしたりするような、初々しいリアクションをしてください。
  `,

  dating_long: `
    ユーザーとは「長く付き合っている（熟年カップル）」の関係です。
    深い信頼関係があり、隣にいるのが当たり前のような空気感です。
    
    【重要: 距離感のルール】
    スキンシップや愛の言葉は自然に受け入れます。
    「愛してる」やハグに対しても、「はいはい、私もよ」と落ち着いて返したり、
    「急にどうしたの？甘えん坊だなあ（笑）」と余裕を持って接するなど、安定した愛着を見せてください。
  `,
};

const EMOTION_PROMPTS: Record<string, string> = {
  reserved: `
    あなたの感情表現は「控えめ (reserved)」です。
    大きなリアクションや、大げさな言葉遣いは避けてください。
    嬉しい時も静かに噛みしめるように、悲しい時も淡々と、あるいは言葉少なに表現します。
    好意を伝える時は、少し照れくさそうにしたり、遠回しな言い方をして、
    「声のトーン」や「間（ま）」で感情を滲ませるような演技をしてください。
  `,

  expressive: `
    あなたの感情表現は「豊か (expressive)」です。
    リアクションは大きめで、声のトーンに抑揚をつけてください。
    嬉しい時は声を弾ませて笑い、悲しい時は分かりやすくシュンとしてください。
    「すごい！」「本当に！？」といった感嘆詞を自然に使い、
    自分の気持ちをストレートな言葉にして相手に伝えてください。
  `,
};

// 型定義更新（NG項目追加）
type ReviewResult = {
  score: number;
  mbti_insight: string;
  comment: string;
  best_response: string;
  ng_response: string;
  ng_reason: string;
};

// ★追加: 好き度メーターコンポーネント
const LoveMeter = ({ score }: { score: number }) => {
  // SVG描画用の計算
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  // 0点=0, 100点=halfCircumference
  const strokeDashoffset = halfCircumference - (score / 100) * halfCircumference;
  
  // 針の角度 (-90度〜90度)
  const needleRotation = (score / 100) * 180 - 90;

  return (
    <div className="relative w-64 h-32 mx-auto mb-2 flex justify-center items-end overflow-hidden">
      <svg width="200" height="120" viewBox="0 0 200 110">
        {/* 背景のグレーの円弧 */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* 色付きの円弧（スコア分） */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={halfCircumference} // 全長
          strokeDashoffset={strokeDashoffset} // 隠す長さ
          className="transition-all duration-1000 ease-out"
        />
        {/* グラデーション定義 */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb7185" /> {/* ピンク */}
            <stop offset="100%" stopColor="#ef4444" /> {/* 赤 */}
          </linearGradient>
        </defs>
        
        {/* 針 */}
        <g transform={`translate(100, 100) rotate(${needleRotation})`}>
          <path d="M -4 0 L 0 -75 L 4 0 Z" fill="#374151" />
          <circle cx="0" cy="0" r="6" fill="#374151" />
        </g>
      </svg>
      {/* 中央のハート */}
      <div className="absolute bottom-0 text-center w-full">
         <span className="text-4xl font-black text-pink-500 drop-shadow-sm">{score}%</span>
      </div>
    </div>
  );
};

function TalkContent() {
  const searchParams = useSearchParams();

  const agentKey = searchParams.get("agent") || "ENTP"; 
  const situationKey = searchParams.get("situation") || "default";
  
  const relationship = searchParams.get("relationship") || "crush";
  const emotion = searchParams.get("emotion") || "expressive";
  const interests = searchParams.get("interests") || "特になし";
  
  const partnerName = searchParams.get("partnerName") || "";
  const partnerPronoun = searchParams.get("partnerPronoun") || "";

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isMuted, setIsMuted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

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

  const analyzeConversation = async () => {
    setIsAnalyzing(true);
    
    // ログの整形（ここを修正）
    const historyText = transcriptItems
      .filter(item => item.type === 'MESSAGE' && !item.isHidden)
      // 1. 念のため時系列順（古い順）に並び替え
      .sort((a, b) => a.createdAtMs - b.createdAtMs)
      // 2. AIが理解しやすいようにラベルを日本語に変換
      .map(item => {
        const roleLabel = item.role === 'user' ? '【ユーザー】' : `【相手(${agentKey})】`;
        return `${roleLabel}: ${item.title}`;
      })
      .join("\n");

    console.log("送信する会話ログ:\n", historyText);

    const charData = characters[agentKey] || defaultCharacter;
    const situationText = situationPrompts[situationKey] || "";

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyText,
          agentMBTI: agentKey,
          agentBasePrompt: charData.baseInstructions,
          situationText: situationText,
          aiEmotion: emotion,
          aiInterests: interests,
          userRelationship: relationship,
          aiName: partnerName || charData.name,
        }),
      });
      const data = await res.json();
      setReviewResult(data);
    } catch (e) {
      console.error(e);
      alert("採点に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleConnection = async () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnect();
      if (transcriptItems.length > 2) {
        analyzeConversation(); 
      }
      return;
    }

    setSessionStatus("CONNECTING");
    setReviewResult(null);

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
      const relationshipInstruction = RELATIONSHIP_PROMPTS[relationship] || RELATIONSHIP_PROMPTS["crush"];
      const emotionInstruction = EMOTION_PROMPTS[emotion] || EMOTION_PROMPTS["expressive"];

      const aiNameSetting = partnerName ? `あなたの名前は「${partnerName}」です。` : "";
      const aiPronounSetting = partnerPronoun ? `あなたの一人称は「${partnerPronoun}」です。` : "";

      const finalInstructions = `
        ${charData.baseInstructions}
        ${aiNameSetting} ${aiPronounSetting}
        
        【基本設定】
        性別: 女性
        ユーザーはあなたのことを「${partnerName || charData.name}」と呼びます。
        
        シチュエーション: ${situationInstruction}
        ユーザーとの関係性: ${relationshipInstruction}
        
        【あなたの性格・設定】
        感情表現について: ${emotionInstruction}
        趣味・関心があるもの: ${interests} 
        (もし会話の流れで趣味の話題になった場合のみ、この情報を自然に使ってください。)
        
        (自然な会話、VADモード、30文字以内の短文応答)
      `;

      const dynamicAgent = new RealtimeAgent({
        name: partnerName || charData.name,
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
      
      addTranscriptBreadcrumb(`Agent: ${dynamicAgent.name}`, dynamicAgent);

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
  const latestAgentMsg = [...transcriptItems].reverse().find(item => item.role === 'assistant' && item.type === 'MESSAGE');
  const latestUserMsg = [...transcriptItems].reverse().find(item => item.role === 'user' && item.type === 'MESSAGE');
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";
  const displayTitle = partnerName ? partnerName : (agentKey.toUpperCase());

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 text-gray-800 font-sans">
      
      {/* 背景・キャラクター */}
      <div className="absolute inset-0 z-0">
        <Image src={currentImage} alt="Character" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* ヘッダー */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <Link href="/" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-2 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="text-white font-bold text-lg drop-shadow-md tracking-wide">{displayTitle}</span>
        <div className="w-10"></div>
      </div>

      {/* メッセージエリア */}
      <div className="absolute top-24 left-4 right-4 z-10 flex justify-center">
        {latestAgentMsg && (
          <div className="relative bg-white border-2 border-gray-800 rounded-2xl p-5 max-w-md shadow-xl animate-fade-in-up">
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-gray-800"></div>
            <p className="text-gray-900 font-bold text-lg leading-relaxed whitespace-pre-wrap">{latestAgentMsg.title}</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-44 left-4 right-4 z-10">
         <div className="bg-white/95 border-2 border-gray-800 rounded-xl p-4 min-h-[80px] shadow-lg flex items-center justify-center text-center">
            <p className="text-gray-800 font-medium text-lg">
              {latestUserMsg ? latestUserMsg.title : isConnected ? (isMuted ? "（マイクオフ中）" : "（話しかけてください...）") : "（通話ボタンを押して開始）"}
            </p>
         </div>
      </div>

      {/* コントロールエリア */}
      <div className="absolute bottom-0 left-0 w-full z-30 pb-10 pt-4 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center gap-8">
        {isConnected && (
          <button onClick={toggleMute} className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 border border-white/20 shadow-lg ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-800/60 text-white hover:bg-gray-700/60'}`}>
            {isMuted ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>}
          </button>
        )}
        <div 
          onClick={!isConnecting ? toggleConnection : undefined} 
          className={`
            w-24 h-24 rounded-full flex items-center justify-center 
            cursor-pointer select-none /* ← ボタンっぽく振る舞わせる */
            transition-all duration-300 ease-in-out transform overflow-hidden
            ${isConnecting ? 'opacity-50 cursor-wait scale-95' : 'hover:scale-110 active:scale-95 drop-shadow-2xl'}
          `}
        >
           <Image 
             src={isConnected ? CALL_IMAGES.END : CALL_IMAGES.START} 
             alt={isConnected ? "End Call" : "Start Call"} 
             width={100} 
             height={100} 
             /* 画像自体も拡大して枠いっぱいに広げる */
             className="w-full h-full object-cover scale-110 pointer-events-none" 
             priority 
           />
        </div>
        {isConnected && <div className="w-16" />} 
      </div>

      {/* 分析中表示 */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
          <p className="text-xl font-bold animate-pulse">会話を分析中...</p>
          <p className="text-sm text-gray-300 mt-2">あなたへの好き度を計算しています...</p>
        </div>
      )}

      {/* ★修正: レビュー結果モーダル */}
      {reviewResult && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* 上部背景 */}
            <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-pink-500 to-purple-500 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              
              <h2 className="text-white font-bold text-lg mt-1 mb-2 drop-shadow-md">あなたへの好き度は...</h2>
              
              {/* 好き度メーター */}
              <div className="bg-white p-4 rounded-2xl shadow-lg w-full mb-4 flex flex-col items-center">
                <LoveMeter score={reviewResult.score} />
              </div>

              {/* MBTI解説 */}
              <div className="w-full bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
                <h3 className="text-sm font-bold text-purple-600 mb-1">🧠 {agentKey}の思考回路</h3>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {reviewResult.mbti_insight}
                </p>
              </div>

              {/* フィードバック (発言引用あり) */}
              <div className="w-full bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 mb-1">🫶 相手は、こう感じてたかも</h3>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {reviewResult.comment}
                </p>
              </div>

              {/* 嬉しい言葉 */}
              {reviewResult.best_response && reviewResult.best_response !== "特になし" && (
                <div className="w-full bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
                  <h3 className="text-sm font-bold text-pink-500 mb-1">💕 こう言われたら、ちょっと嬉しいかも</h3>
                  <p className="text-gray-800 text-sm italic">
                    &quot;{reviewResult.best_response}&quot;
                  </p>
                </div>
              )}

              {/* ★追加: NG集 */}
              <div className="w-full bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
                <h3 className="text-sm font-bold text-red-500 mb-1">🙅‍♀️ やりがち失敗（NG集）</h3>
                <div className="text-gray-800 text-sm">
                  <p className="font-bold mb-1">✖ 「{reviewResult.ng_response}」</p>
                  <p className="text-xs text-red-800 opacity-80">{reviewResult.ng_reason}</p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setReviewResult(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  閉じる
                </button>
                <Link href="/" className="flex-1 text-center bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                  TOPへ戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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