"use client";

type MBTIProfile = {
  emoji: string;
  name: string;
  alias: string;
  description: string;
  color: string;
  loveStyle: string;
};

const SAMPLE_PROFILE: MBTIProfile = {
  emoji: "🔥",
  name: "情熱タイプ",
  alias: "The Passionate",
  description: "エネルギッシュで積極的に動き、周囲を巻き込むリーダー気質。",
  color: "text-red-500",
  loveStyle: "感情を率直に表現するタイプ",
};

export default function MBTICard() {
  const type = "ENTP"; // 好きなタイプ名をここで変更可能

  return (
    <div
      className="
        cursor-pointer overflow-hidden relative group h-full flex flex-col 
        bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        p-0
      "
      style={{ width: "260px" }}
    >
      {/* 上の絵文字部分 */}
      <div
        className={`h-24 w-full flex items-center justify-center text-6xl ${SAMPLE_PROFILE.color}`}
      >
        {SAMPLE_PROFILE.emoji}
      </div>

      {/* 中央の説明部分 */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-2xl font-black">{type}</h3>
          <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-full">
            {SAMPLE_PROFILE.name}
          </span>
        </div>

        <p className="text-sm font-bold text-gray-500 mb-2">
          {SAMPLE_PROFILE.alias}
        </p>

        <p className="text-sm text-gray-700 line-clamp-3 flex-grow">
          {SAMPLE_PROFILE.description}
        </p>

        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
          <p className="text-xs font-bold text-red-500">
            ❤️ {SAMPLE_PROFILE.loveStyle.substring(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  );
}
