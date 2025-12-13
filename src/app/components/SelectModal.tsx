"use client";

import React from "react";
import {
	PartnerName,
	PartnerPronoun,
	Relationship,
	EmotionExpression,
	Interests,
	AdditionalContext,
	RelationshipLabels,
	EmotionLabels,
} from "../lib/relationship";

type Props = {
	open: boolean;
	onClose: () => void;
	selectedMbti: string;
	onSubmit: (info: AdditionalContext) => void;
};

export default function SelectModal({ open, onClose, selectedMbti,onSubmit }: Props) {
	const [partnerName, setPartnerName] = React.useState<PartnerName>("");
	const [partnerPronoun, setPartnerPronoun] = React.useState<PartnerPronoun>("");
	const [relationship, setRelationship] = React.useState<Relationship>("crush");
	const [emotion, setEmotion] = React.useState<EmotionExpression>("reserved");
	const [interests, setInterests] = React.useState<string>("");

	if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">相手のことをもう少し教えて</h2>
				{/* MBTI */}
				<div className="mb-4">
					{selectedMbti && <p>MBTI : {selectedMbti}</p>}
				</div>
				{/* 名前 */}
				<div>
					<p className="mb-2">相手の名前</p>
					<input
						type="text"
						value={partnerName}
						onChange={(e) => setPartnerName(e.target.value)}
						placeholder="例 ： 花子"
						className="w-full border rounded-lg px-3 py-2 mb-4"
					/>
				</div>
				{/* 一人称 */}
				<div>
					<p className="mb-2">相手の一人称</p>
					<input
						type="text"
						value={partnerPronoun}
						onChange={(e) => setPartnerPronoun(e.target.value)}
						placeholder="例 ： 私"
						className="w-full border rounded-lg px-3 py-2 mb-4"
					/>
				</div>

        {/* 関係性 */}
        <div className="mb-4">
          <p className="mb-2">関係の深さ</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(RelationshipLabels) as Relationship[]).map((key) => (
              <button
                key={key}
                onClick={() => setRelationship(key)}
                className={`px-3 py-2 rounded-lg border
                  ${
                    relationship === key
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }
                `}
              >
                {RelationshipLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {/* 感情表現 */}
        <div className="mb-4">
          <p className="mb-2">感情表現</p>
          <div className="flex gap-2">
            {(Object.keys(EmotionLabels) as EmotionExpression[]).map((key) => (
              <button
                key={key}
                onClick={() => setEmotion(key)}
                className={`px-3 py-2 rounded-lg border
                  ${
                    emotion === key
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }
                `}
              >
                {EmotionLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {/* 趣味・関心 */}
        <div className="mb-6">
          <p className="mb-2">趣味・関心（任意）</p>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="例：音楽、映画、旅行"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* アクション */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">
            キャンセル
          </button>
          <button
            onClick={() =>
              onSubmit({
								partnerName,
								partnerPronoun,
                relationship,
                emotion,
                interests,
              })
            }
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
}	
