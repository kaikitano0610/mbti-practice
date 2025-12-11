"use client"; // ここも必須

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { characters, defaultCharacter } from '@/app/characters';
import Link from "next/link";

export default function TalkPage() {
  const searchParams = useSearchParams();

  const agent = searchParams.get("agent");
  const situation = searchParams.get("situation");
  const gender = searchParams.get("gender");
  const details = searchParams.get("details");

  const [finalPrompt, setFinalPrompt] = useState("");

  useEffect(() => {
    const instructions = `
      あなたはMBTI:${agent}のキャラクターです。
      相手の性別は${gender}です。
      現在は「${situation}」というシチュエーションで会話しています。
      追加設定: ${details || "特になし"}
    `;
    setFinalPrompt(instructions);
    
    //ここでconnect({ ... initialAgents: ... }) を呼ぶ
    console.log("AIに送る設定:", instructions);
  }, [agent, situation, gender, details]);

  return (
    <div style={{ padding: 20 }}>
      <h1>会話画面</h1>
      <div>ここで会話スタート！コンソールに表示されてるようなプロンプトで、AIを起動！</div>

      <div style={{ marginTop: 20 }}>
        <Link href="/">TOPに戻る</Link>
      </div>
    </div>
  );
}