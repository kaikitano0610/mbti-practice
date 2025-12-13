"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import SingleCard from "../components/SingleCard";
import {MBTIProfiles} from "../lib/mbti-profile";
import SelectModal from "../components/SelectModal";

export default function Page() {
  const searchParams = useSearchParams();
  const situation = searchParams.get("situation");
  const router = useRouter();
  
  const [selectMbti, setSelectMbti] = useState<string | null>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleStart = () => {
    router.push("/");
  };
  const handleCardClick = (mbti: string) => {
    setSelectMbti(mbti);
    setIsModalOpen(true);
  }
  const mbtiGroups = [
  { name: "ALL", dot: false },
  { name: "SP", dot: true, gradient: "linear-gradient(145deg, #FFC107, #FFEB3B)" },
  { name: "NF", dot: true, gradient: "linear-gradient(145deg, #4CAF50, #00C853)" },
  { name: "NT", dot: true, gradient: "linear-gradient(145deg, #8E2DE2, #4A00E0)" },
  { name: "SJ", dot: true, gradient: "linear-gradient(145deg, #2196F3, #1976D2)" },
  ];

  const groupGradients: Record<string, string> = {
    NT: "linear-gradient(145deg, #8b5cf6, #6d28d9)", // 紫
    NF: "linear-gradient(145deg, #22c55e, #16a34a)", // 緑
    SJ: "linear-gradient(145deg, #3b82f6, #1d4ed8)", // 青
    SP: "linear-gradient(145deg, #facc15, #f59e0b)", // 黄
  }

  // タグの共通スタイル
  const tagBaseClasses = `
    bg-white py-2 px-4 rounded-xl mb-4 mr-4
    inline-flex items-center justify-center
    text-mg whitespace-nowrap
    border-2 border-[#6a6a6a]
    transition-all duration-100 ease-in-out
  `;
  return (
    <div className="bg-[#fff6ea] flex flex-col items-center min-h-screen">
      <div className="w-full flex items-center">
        <button
          onClick={handleStart}
        >
          <Image
            src="/select-back.png"
            alt=""
            width={100}
            height={150}
            className="translate-y-[3px]"
          />
        </button>
        <p className="text-3xl">誰と話す？</p>
      </div>

      <div className="mt-2 mb-4 ml-2">
        {/* 1行目 (3つのタグ) */}
        <div className="flex justify-center mb-1">
          {mbtiGroups.slice(0, 3).map((group) => (
            <button 
              key={group.name} 
              className={tagBaseClasses}
            >
              {/* 色付きのインジケーター */}
              {group.dot && (
                <span 
                  className={`w-5 h-5 rounded-full mr-2 bg-${group.color} shadow-sm`}
                  // グラデーション効果を再現するために、インラインスタイルでグラデーションを設定
                  style={{
                    background: groupGradients[group.name],
                  }}
                ></span>
              )}
              <span className="text-[#6a6a6a]">{group.name}</span>
            </button>
          ))}
        </div>

        {/* 2行目 (2つのタグ) - 中央に配置するため、余分なマージンを調整 */}
        <div className="flex justify-center"> {/* タグ1個分の幅（px-4, mr-4）の半分程度を左にずらす */}
          {mbtiGroups.slice(3, 5).map((group) => (
            <button 
              key={group.name} 
              className={tagBaseClasses}
            >
              {/* 色付きのインジケーター */}
              {group.dot && (
                <span 
                  className={`w-5 h-5 rounded-full mr-2 bg-${group.color} shadow-sm`}
                  style={{
                    background: groupGradients[group.name],
                  }}
                ></span>
              )}
              <span className="text-[#6a6a6a]">{group.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 一覧表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
        {Object.entries(MBTIProfiles).map(([key, profile]) => (
          <SingleCard
            key={key}
            type={key}
            profile={profile}
            onClick={() => handleCardClick(key)}
          />
        ))}
      </div>
      <SelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMbti={selectMbti}
        onSubmit={(info) => {
          router.push(
            `/talk?mbti=${selectMbti}` +
            `&situation=${situation}` +
            `&partnerName=${encodeURIComponent(info.partnerName)}` +
            `&partnerPronoun=${encodeURIComponent(info.partnerPronoun)}` +
            `&relationship=${info.relationship}` +
            `&emotion=${info.emotion}` +
            `&interests=${encodeURIComponent(info.interests)}`
          );
        }}
      />
    </div>
  );
}
