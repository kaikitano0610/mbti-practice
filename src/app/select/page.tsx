"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import SingleCard from "../components/SingleCard";
import { MBTIProfiles } from "../lib/mbti-profile";
import SelectModal from "../components/SelectModal";
import { AdditionalContext, RelationshipLabels, EmotionLabels } from "../lib/relationship";

// 保存データの型定義
type SavedProfile = AdditionalContext & {
  mbti: string;
  id: string; 
};

export default function Page() {
  const searchParams = useSearchParams();
  const situation = searchParams.get("situation");
  const router = useRouter();
  
  const [selectMbti, setSelectMbti] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 履歴データ
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  // 現在編集中のデータ（新規の場合はnull）
  const [editingProfile, setEditingProfile] = useState<SavedProfile | null>(null);

  // 初回読み込み
  useEffect(() => {
    const storedData = localStorage.getItem("mbti_chat_history");
    if (storedData) {
      try {
        setSavedProfiles(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse saved profiles", e);
      }
    }
  }, []);

  const handleStart = () => {
    router.push("/");
  };

  // 通常のカードクリック（新規作成）
  const handleCardClick = (mbti: string) => {
    setSelectMbti(mbti);
    setEditingProfile(null); // 新規モード
    setIsModalOpen(true);
  };

  // 履歴カードクリック（即会話開始）
  const handleSavedCardClick = (profile: SavedProfile) => {
    router.push(
      `/talk?agent=${profile.mbti}` + // query param name修正: mbti -> agent
      `&situation=${situation || "default"}` +
      `&partnerName=${encodeURIComponent(profile.partnerName)}` +
      `&partnerPronoun=${encodeURIComponent(profile.partnerPronoun)}` +
      `&relationship=${profile.relationship}` +
      `&emotion=${profile.emotion}` +
      `&interests=${encodeURIComponent(profile.interests)}`
    );
  };

  // 編集ボタンクリック
  const handleEditClick = (profile: SavedProfile) => {
    setSelectMbti(profile.mbti);
    setEditingProfile(profile); // 編集モード
    setIsModalOpen(true);
  };

  // モーダル決定（新規・更新共通）
  const handleModalSubmit = (info: AdditionalContext) => {
    let updatedProfiles: SavedProfile[];

    if (editingProfile) {
        // ★編集の場合：IDが一致するものを更新
        updatedProfiles = savedProfiles.map(p => 
            p.id === editingProfile.id 
            ? { ...p, ...info } // IDとMBTIはそのまま、infoだけ上書き
            : p
        );
    } else {
        // ★新規の場合：先頭に追加
        const newProfile: SavedProfile = {
            ...info,
            mbti: selectMbti,
            id: Date.now().toString(),
        };
        updatedProfiles = [newProfile, ...savedProfiles].slice(0, 6); // 最大6件
    }
    
    setSavedProfiles(updatedProfiles);
    localStorage.setItem("mbti_chat_history", JSON.stringify(updatedProfiles));
    setIsModalOpen(false); // モーダルを閉じる

    // 編集時は遷移しない（リスト更新のみ）？ 
    // UX的には「保存して閉じる」だけの方が親切かもしれませんが、
    // ここでは仕様に合わせて「決定したら会話へ遷移」させない方が良い（編集だけしたい場合もあるため）。
    // もし「編集してすぐ会話」なら以下のrouter.pushを有効にしてください。
    // 今回は「編集ボタン→保存」なのでモーダル閉じるだけにします。
  };
  
  // 会話開始（モーダルが新規作成で閉じられた時用）
  // ただし、現在のSelectModalの仕様だとonSubmitでデータが返ってくるだけなので、
  // 上記handleModalSubmit内で分岐して遷移するか決める必要があります。
  // ここでは「新規作成時のみ遷移」「編集時は保存のみ」とします。
  
  const handleModalSubmitWithNavigation = (info: AdditionalContext) => {
      handleModalSubmit(info);
      
      // 新規作成時のみ、そのまま会話へ遷移させる
      if (!editingProfile) {
         router.push(
            `/talk?agent=${selectMbti}` +
            `&situation=${situation || "default"}` +
            `&partnerName=${encodeURIComponent(info.partnerName)}` +
            `&partnerPronoun=${encodeURIComponent(info.partnerPronoun)}` +
            `&relationship=${info.relationship}` +
            `&emotion=${info.emotion}` +
            `&interests=${encodeURIComponent(info.interests)}`
        );
      }
  };


  const mbtiGroups = [
    { name: "ALL", dot: false },
    { name: "SP", dot: true, gradient: "linear-gradient(145deg, #FFC107, #FFEB3B)" },
    { name: "NF", dot: true, gradient: "linear-gradient(145deg, #4CAF50, #00C853)" },
    { name: "NT", dot: true, gradient: "linear-gradient(145deg, #8E2DE2, #4A00E0)" },
    { name: "SJ", dot: true, gradient: "linear-gradient(145deg, #2196F3, #1976D2)" },
  ];

  const groupGradients: Record<string, string> = {
    NT: "linear-gradient(145deg, #8b5cf6, #6d28d9)", 
    NF: "linear-gradient(145deg, #22c55e, #16a34a)", 
    SJ: "linear-gradient(145deg, #3b82f6, #1d4ed8)", 
    SP: "linear-gradient(145deg, #facc15, #f59e0b)", 
  };

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
        <button onClick={handleStart}>
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
        {/* タグ表示 (省略なし) */}
        <div className="flex justify-center mb-1">
          {mbtiGroups.slice(0, 3).map((group) => (
            <button key={group.name} className={tagBaseClasses}>
              {group.dot && (
                <span className="w-5 h-5 rounded-full mr-2 shadow-sm" style={{ background: groupGradients[group.name] }}></span>
              )}
              <span className="text-[#6a6a6a]">{group.name}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          {mbtiGroups.slice(3, 5).map((group) => (
            <button key={group.name} className={tagBaseClasses}>
              {group.dot && (
                <span className="w-5 h-5 rounded-full mr-2 shadow-sm" style={{ background: groupGradients[group.name] }}></span>
              )}
              <span className="text-[#6a6a6a]">{group.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 履歴表示エリア */}
      {savedProfiles.length > 0 && (
        <div className="w-full max-w-7xl px-4 mb-8">
          <p className="text-xl font-bold mb-4 ml-2 text-gray-700">また話す？（履歴）</p>
          <div className="flex overflow-x-auto pb-4 gap-6 px-2 scrollbar-hide">
            {savedProfiles.map((saved) => {
              const originalProfile = MBTIProfiles[saved.mbti];
              if (!originalProfile) return null;

              // ★テキスト生成ロジック
              const aliasText = saved.partnerPronoun 
                ? `${saved.partnerPronoun}とまた話そ？` 
                : "また話そ？";
                
              const descriptionText = [
                RelationshipLabels[saved.relationship],
                EmotionLabels[saved.emotion],
                saved.interests
              ].filter(Boolean).join(" / "); // 区切り文字で結合

              return (
                <div key={saved.id} className="flex-shrink-0">
                  <SingleCard
                    type={saved.partnerName || saved.mbti}
                    profile={originalProfile} 
                    onClick={() => handleSavedCardClick(saved)}
                    isSaved={true}
                    onEdit={() => handleEditClick(saved)} // 編集モード起動
                    customAlias={aliasText} // カスタム一言
                    customDescription={descriptionText} // カスタム説明
                  />
                </div>
              );
            })}
          </div>
          <div className="border-b-2 border-gray-300 w-full my-4 opacity-50"></div>
        </div>
      )}

      {/* 通常一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
        {Object.entries(MBTIProfiles).map(([key, profile]) => (
          <SingleCard
            key={key}
            type={key}
            profile={profile}
            onClick={() => handleCardClick(key)}
            isSaved={false}
          />
        ))}
      </div>

      <SelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMbti={selectMbti}
        onSubmit={handleModalSubmitWithNavigation}
        initialValues={editingProfile || undefined} // 編集時は初期値を渡す
      />
    </div>
  );
}