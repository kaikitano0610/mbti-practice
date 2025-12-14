"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import SituationModal from "./components/SituationModal";
import { Situation, Situations } from "./lib/situations";

// ローディング用のスピナーコンポーネント（見た目は自由に変更可能です）
const LoadingSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff6ea]/80 backdrop-blur-sm">
    <div className="animate-spin h-12 w-12 border-4 border-[#FF1010] rounded-full border-t-transparent"></div>
  </div>
);

export default function Top() {
  const router = useRouter();
  const [situation, setSituation] = useState<string>("");
  const [isSituationOpen, setIsSituationOpen] = useState(false);
  
  // ★追加: ローディング状態管理 (初期値をtrueにしておくことで初回ロード時も表示)
  const [isLoading, setIsLoading] = useState(true);

  // ★追加: 初回マウント時に少しだけローディングを見せる（画像の読み込み待ち演出など）
  useEffect(() => {
    // 0.5秒後にローディングを解除
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#fff6ea] flex flex-col items-center min-h-screen relative">
      
      {/* ★追加: ローディング中はスピナーを表示 */}
      {isLoading && <LoadingSpinner />}

      <div className="flex flex-col justify-center mt-20">
        <div className="mx-auto">
          <Image
            src="/title.png"
            alt=""
            width={400}
            height={200}
            className="mx-auto"
            priority // ★追加: タイトル画像は優先的に読み込む
          />
          <Image
            src="/title2.png"
            alt=""
            width={400}
            height={200}
            className="mx-auto"
            priority // ★追加
          />
        </div>
        {/* 3. 今すぐ話すボタン*/}
        <button
          onClick={() => setIsSituationOpen(true)}
          className={`
            w-80 fixed left-1/2 transform -translate-x-1/2
            py-4 px-14 rounded-xl bottom-[90px]
            inline-flex items-center justify-center
            transition-all duration-200 ease-in-out text-2xl 
            shadow-[6px_6px_0_0_#000000]
            hover:shadow-[2px_2px_0_0_#000000]
            active:shadow-[0px_0px_0_0_#000000]
            bg-[#FF1010] text-white hover:bg-[#e60e0e]
          `}
        >
          <svg
            className="w-6 h-6 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M16 6H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2z"
            ></path>
          </svg>

          <span>今すぐ話す</span>
        </button>
      </div>

      <SituationModal
        isOpen={isSituationOpen}
        situation={situation}
        onSelect={(value) => setSituation(value)}
        onClose={() => {
          setIsSituationOpen(false);
          if(situation) {
            // ★追加: 画面遷移の直前にローディングを開始する
            setIsLoading(true);
            router.push(`/select?situation=${situation}`);
          }
        }}
      />
    </div>
  );
}