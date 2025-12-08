"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Top() {
  const router = useRouter();
  // 仮の状態管理（実際はボタン等で変更させる）
  const [situation, setSituation] = useState("cafe_date");
  const [gender, setGender] = useState("female");

  // 次のページにクエリで送る
  const handleStart = () => {
    router.push(`/select?situation=${situation}&gender=${gender}`);
  };

  return (
    <div>
      <button onClick={handleStart}>
        今すぐ話す
      </button>
    </div>
  );
}
