"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Top() {
  const router = useRouter();
  const [situation, setSituation] = useState("cafe_date");
  const [gender, setGender] = useState("female");

  const handleStart = () => {
    router.push(`/select?situation=${situation}&gender=${gender}`);
  };

  return (
    <div className="bg-[#fff6ea] flex flex-col items-center min-h-screen">
      <Image
        src="/title.png"
        alt=""
        width={400}
        height={200}
        className="mx-auto"
      />

      <div className="flex flex-col justify-center mt-20">
        {/* 1. シチュエーションボタン (画像通りの白ボタン) */}
        <button
          className="
            w-80
            bg-white py-4 px-14 rounded-xl mb-10 font-bold
            inline-flex items-center justify-center
            transition-all duration-200 ease-in-out text-2xl border-2 border-black
          "
        >
          <span>シチュエーション</span>
        </button>

        {/* 2. 性別ボタン (画像通りの白ボタン) */}
        <button
          className="
            w-80
            bg-white py-4 px-14 rounded-xl mb-5 font-bold
            inline-flex items-center justify-center
            transition-all duration-200 ease-in-out text-2xl border-2 border-black
          "
        >
          <span>性別</span>
        </button>
      </div>

      {/* 3. 今すぐ話すボタン (画像通りの赤ボタン、アイコン付き、影あり) */}
      <button
        onClick={handleStart}
        className="
          w-80 fixed
          /* ★背景色、テキスト色をカスタムに設定★ */
          bg-[#FF1010] text-white py-4 px-14 rounded-xl bottom-[30px]
          
          inline-flex items-center justify-center
          transition-all duration-200 ease-in-out text-2xl 
          /* ★画像では枠線がないため border-2 border-black は含めない★ */
          
          /* ★立体的な影を適用★ */
          shadow-[6px_6px_0_0_#000000]
          hover:shadow-[2px_2px_0_0_#000000]
          active:shadow-[0px_0px_0_0_#000000]
          
          /* ★影のオフセット（5px）に合わせて沈み込み量を修正★ */
          active:translate-x-[5px]
          active:translate-y-[5px]
          
          /* ★ホバー時の色をカスタムカラーに合わせて修正★ */
          hover:bg-[#e60e0e]
        "
      >
        {/* ★アイコンを復活★ */}
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
  );
}