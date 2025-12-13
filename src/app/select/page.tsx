"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 前のページから受け取るデータ
  const situation = searchParams.get("situation");
  const gender = searchParams.get("gender");

  // 次のページに送るデータ & モーダル管理用の状態
  const [selectedAgent, setSelectedAgent] = useState("");
  const [details, setDetails] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // ★モーダルの開閉スイッチ

  // キャラクターをクリックした時の処理
  const handleCharClick = (agent: string) => {
    setSelectedAgent(agent);
    setIsModalOpen(true); // モーダルを開く
  };

  const handleStartTalk = () => {
    // URLにクエリを設定する便利なやつらしい
    const params = new URLSearchParams();
    if (situation) params.set("situation", situation);
    if (gender) params.set("gender", gender);
    params.set("agent", selectedAgent);
    params.set("details", details);

    router.push(`/talk?${params.toString()}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>キャラ選択画面</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => handleCharClick("ENTP")}>ENTP</button>
        <button onClick={() => handleCharClick("INFP")}>INFP</button>
        <button onClick={() => handleCharClick("ENFJ")}>ENFJ</button>
        ...
      </div>

      {isModalOpen && (
        <div 
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)", 
            backgroundColor: "white",
            border: "1px solid black",
            padding: "20px",
            zIndex: 1000,
            width: "300px"
          }}
        >
          <h3>{selectedAgent} の詳細設定</h3>
          
          <div style={{ marginBottom: "15px" }}>
            {/* 実際はもっと分類して良いUIにしたい */}
            <p>詳細設定 </p>
            <input 
              type="text" 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              placeholder="趣味や性格など..." 
              style={{ border: "1px solid gray", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={handleStartTalk} style={{ background: "pink" }}>
              開始する
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}