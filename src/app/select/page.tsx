"use client";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import SingleCard from "../components/SingleCard";
import { MBTIProfiles } from "../lib/mbti-profile";
import SelectModal from "../components/SelectModal";
import { AdditionalContext, RelationshipLabels, EmotionLabels } from "../lib/relationship";

// ローディング用のスピナーコンポーネント
const LoadingSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff6ea]/80 backdrop-blur-sm">
    <div className="animate-spin h-12 w-12 border-4 border-[#FF1010] rounded-full border-t-transparent"></div>
  </div>
);

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
  
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  // 履歴データ
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  // 現在編集中のデータ（新規の場合はnull）
  const [editingProfile, setEditingProfile] = useState<SavedProfile | null>(null);

  // ★追加: ローディング状態管理 (初期値true)
  const [isLoading, setIsLoading] = useState(true);

  // ★追加: 初回マウント時のローディング制御
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 初回読み込み（LocalStorage）
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
    // ★追加: 戻るボタン押下時にローディング開始
    setIsLoading(true);
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
    // ★追加: 遷移前にローディング開始
    setIsLoading(true);
    router.push(
      `/talk?agent=${profile.mbti}` + 
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
            ? { ...p, ...info } 
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
  };
  
  const handleModalSubmitWithNavigation = (info: AdditionalContext) => {
      handleModalSubmit(info);
      
      // 新規作成時のみ、そのまま会話へ遷移させる
      if (!editingProfile) {
         // ★追加: 遷移前にローディング開始
         setIsLoading(true);
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

  const filteredProfiles = useMemo(() => {
    const allProfiles = Object.entries(MBTIProfiles);

    if (selectedGroup === "ALL") return allProfiles;

    return allProfiles.filter(([_, profile]) => {
      return profile.group === selectedGroup;
    });
  }, [selectedGroup]);

  const getTagStyles = (groupName: string) => {
    const isSelected = selectedGroup === groupName;
    const base = "py-2 px-4 rounded-xl mb-4 mr-4 inline-flex items-center justify-center text-mg whitespace-nowrap border-2 transition-all duration-200 ease-in-out";
    const active = "bg-gray-100 border-[#6a6a6a] text-[#6a6a6a] shadow-sm transform scale-105 font-medium";
    const inactive = "bg-white border-[#6a6a6a] text-[#6a6a6a] hover:bg-gray-50";
    return `${base} ${isSelected ? active : inactive}`;
  };

  return (
    <div className="bg-[#fff6ea] flex flex-col items-center min-h-screen relative">
      
      {/* ★追加: ローディング表示 */}
      {isLoading && <LoadingSpinner />}

      <div className="w-full flex items-center">
        <button onClick={handleStart}>
          <Image
            src="/select-back.png"
            alt=""
            width={100}
            height={150}
            className="translate-y-[3px]"
            priority // ★追加: 戻るボタンを優先読み込み
          />
        </button>
        <p className="text-3xl">誰と話す？</p>
      </div>

      <div className="mt-2 mb-4 ml-2">
        {/* タグ表示 */}
        <div className="flex justify-center mb-1">
          {mbtiGroups.slice(0, 3).map((group) => (
            <button 
              key={group.name}
              className={getTagStyles(group.name)}
              onClick={() => setSelectedGroup(group.name)}  
            >
              {group.dot && (
                <span className="w-5 h-5 rounded-full mr-2 shadow-sm" style={{ background: groupGradients[group.name] }}></span>
              )}
              <span className="text-[#6a6a6a]">{group.name}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          {mbtiGroups.slice(3, 5).map((group) => (
            <button 
              key={group.name}
              className={getTagStyles(group.name)}
              onClick={() => setSelectedGroup(group.name)}
            >
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

              const aliasText = saved.partnerPronoun 
                ? `${saved.partnerPronoun}とまた話そ？` 
                : "また話そ？";
                
              const descriptionText = [
                RelationshipLabels[saved.relationship],
                EmotionLabels[saved.emotion],
                saved.interests
              ].filter(Boolean).join(" / ");

              return (
                <div key={saved.id} className="flex-shrink-0">
                  <SingleCard
                    type={saved.partnerName || saved.mbti}
                    profile={originalProfile} 
                    onClick={() => handleSavedCardClick(saved)}
                    isSaved={true}
                    onEdit={() => handleEditClick(saved)} 
                    customAlias={aliasText} 
                    customDescription={descriptionText} 
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
        {filteredProfiles.map(([key, profile]) => (
          <SingleCard
            key={key}
            type={key}
            profile={profile}
            onClick={() => handleCardClick(key)}
            isSaved={false}
          />
        ))}
        {filteredProfiles.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-8">
                該当するタイプが見つかりません
            </p>
        )}
      </div>

      <SelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMbti={selectMbti}
        onSubmit={handleModalSubmitWithNavigation}
        initialValues={editingProfile || undefined}
      />
    </div>
  );
}