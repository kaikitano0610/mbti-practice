"use client";
import Image from "next/image";
import { MBTIProfile } from "../lib/mbti-profile";
import { MBTIGroupColors } from "../lib/mbti-colors";

type SingleCardProps = {
  type: string;
  profile: MBTIProfile;
  onClick: () => void;
  isSaved?: boolean;
  onEdit?: () => void; // ★追加：編集ボタン用コールバック
  customAlias?: string; // ★追加：上書き用の一言（一人称など）
  customDescription?: string; // ★追加：上書き用の説明文
};

export default function SingleCard({ 
    type, 
    profile, 
    onClick, 
    isSaved = false, 
    onEdit, 
    customAlias, 
    customDescription 
}: SingleCardProps) {

  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer overflow-hidden relative group h-full flex flex-col 
        bg-white border-2 border-black rounded-xl
        p-0 focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]
      "
      style={{ width: "260px" }}
    >
      <div
        className={`h-24 w-full flex items-center justify-center overflow-hidden`}
        style={{
          background: MBTIGroupColors[profile.group].gradient,
        }}
      >
        <Image
          src={isSaved ? "/images/happy.png" : profile.img}
          alt=""
          width={isSaved ? 90 : (profile.imgWidth || 200)}
          height={isSaved ? 90 : (profile.imgHeight || 150)}
          className={`mx-auto ${isSaved ? "pt-4 object-contain drop-shadow-md" : "pt-20"}`}
        />
      </div>

      <div className="px-4 py-2 flex flex-col flex-grow border-t-2 border-black w-full text-left bg-white relative">
        <div className="flex justify-between items-start mb-1 h-8">
          <h3 className="text-xl font-black truncate pr-1 pt-1">{type}</h3>
          
          {/* ★変更：保存済みの場合は編集ボタン、通常はバッジ */}
          {isSaved ? (
            <button
                onClick={(e) => {
                    e.stopPropagation(); // カードクリック（遷移）を防ぐ
                    if (onEdit) onEdit();
                }}
                className="
                    z-10 text-xs bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1 rounded-full 
                    hover:bg-black hover:text-white hover:border-black transition-colors font-bold
                "
            >
                編集
            </button>
          ) : (
            <span className="text-xs bg-black text-white px-3 py-1 rounded-full whitespace-nowrap mt-1">
              {profile.name}
            </span>
          )}
        </div>

        {/* Alias (一言) */}
        <p className="text-sm font-bold text-gray-500 mb-2 min-h-[1.25rem]">
          {customAlias || profile.alias}
        </p>

        {/* Description (説明文) */}
        {/* 保存済みでもカスタム説明文があれば表示するように変更 */}
        <p className="text-xs text-[#515151] line-clamp-3 flex-grow font-medium leading-relaxed">
           {isSaved ? customDescription : profile.description}
        </p>

        {/* LoveStyle (通常時のみ) */}
        {!isSaved && (
          <div className="mt-3 pt-2 border-t-2 border-dashed border-gray-200 w-full">
            <p className="text-xs text-red-500 font-bold">❤️ {profile.loveStyle}</p>
          </div>
        )}
      </div>
    </div>
  );
}