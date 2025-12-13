"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import SituationModal from "./components/SituationModal";
import { Situation, Situations } from "./lib/situations";

export default function Top() {
  const router = useRouter();
  const [situation, setSituation] = useState("");
  const [isSituationOpen, setIsSituationOpen] = useState(false);

  const handleStart = () => {
    router.push(`/select?situation=${situation}`);
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
        <div className="w-80 mx-auto mb-5">
          <p className="text-center text-2xl break-words">
            {!situation ? (
              <span>シチュエーションを選択してね！</span>
            ) : (
              <>
                <span>選択中：</span>
                <br />
                <span>
                  {Situations.find((s) => s.id === situation)?.label}
                </span>
              </>
            )}
          </p>
        </div>
        {/* 1. シチュエーションボタン*/}
        <button
          onClick={() => setIsSituationOpen(true)}
          className="
            w-80 mx-auto
            bg-white py-4 px-14 rounded-xl mb-10 font-bold
            inline-flex items-center justify-center
            transition-all duration-200 ease-in-out text-2xl border-2 border-black
          "
        >
          <span>シチュエーション</span>
        </button>
      </div>

      {/* 3. 今すぐ話すボタン*/}
      <button
        onClick={handleStart}
        className="
          w-80 fixed
          bg-[#FF1010] text-white py-4 px-14 rounded-xl bottom-[30px]
          
          inline-flex items-center justify-center
          transition-all duration-200 ease-in-out text-2xl 
        
          shadow-[6px_6px_0_0_#000000]
          hover:shadow-[2px_2px_0_0_#000000]
          active:shadow-[0px_0px_0_0_#000000]
          active:translate-x-[5px]
          active:translate-y-[5px]
          hover:bg-[#e60e0e]
        "
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
      <SituationModal
        isOpen={isSituationOpen}
        situation={situation}
        onSelect={setSituation}
        onClose={() => setIsSituationOpen(false)}
      />
    </div>
  );
}