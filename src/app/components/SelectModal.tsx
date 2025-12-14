"use client";

import React, { useEffect } from "react";
import {
	PartnerName,
	PartnerPronoun,
	Relationship,
	EmotionExpression,
	AdditionalContext,
	RelationshipLabels,
	EmotionLabels,
} from "../lib/relationship";

type Props = {
	open: boolean;
	onClose: () => void;
	selectedMbti: string;
	onSubmit: (info: AdditionalContext) => void;
    initialValues?: AdditionalContext; // ★追加：編集時の初期値
};

export default function SelectModal({ open, onClose, selectedMbti, onSubmit, initialValues }: Props) {
	const [partnerName, setPartnerName] = React.useState<PartnerName>("");
	const [partnerPronoun, setPartnerPronoun] = React.useState<PartnerPronoun>("");
	const [relationship, setRelationship] = React.useState<Relationship>("crush");
	const [emotion, setEmotion] = React.useState<EmotionExpression>("reserved");
	const [interests, setInterests] = React.useState<string>("");

    // ★追加：モーダルが開いたときに初期値をセット（編集モード）またはリセット（新規モード）
    useEffect(() => {
        if (open) {
            if (initialValues) {
                setPartnerName(initialValues.partnerName);
                setPartnerPronoun(initialValues.partnerPronoun);
                setRelationship(initialValues.relationship);
                setEmotion(initialValues.emotion);
                setInterests(initialValues.interests);
            } else {
                // 新規の場合はリセット
                setPartnerName("");
                setPartnerPronoun("");
                setRelationship("crush");
                setEmotion("reserved");
                setInterests("");
            }
        }
    }, [open, initialValues]);

	if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-2xl animate-fade-in-up">
        <h2 className="text-xl font-bold mb-4">
            {initialValues ? "設定を編集する" : "相手のことをもう少し教えて"}
        </h2>
		
        {/* MBTI表示 */}
		<div className="mb-4 text-sm text-gray-500 font-bold">
			MBTI : {selectedMbti}
		</div>
		
        {/* 名前 */}
		<div>
			<p className="mb-2 text-sm font-bold">相手のことをなんて呼ぶ？</p>
			<input
				type="text"
				value={partnerName}
				onChange={(e) => setPartnerName(e.target.value)}
				placeholder="例 ： 花子"
				className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-black focus:outline-none"
			/>
		</div>
		
        {/* 一人称 */}
		<div>
			<p className="mb-2 text-sm font-bold">相手の一人称は？</p>
			<input
				type="text"
				value={partnerPronoun}
				onChange={(e) => setPartnerPronoun(e.target.value)}
				placeholder="例 ： 私、僕、俺"
				className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-black focus:outline-none"
			/>
		</div>

        {/* 関係性 */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-bold">関係の深さは？</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(RelationshipLabels) as Relationship[]).map((key) => (
              <button
                key={key}
                onClick={() => setRelationship(key)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all
                  ${
                    relationship === key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
          <p className="mb-2 text-sm font-bold">感情表現は？</p>
          <div className="flex gap-2">
            {(Object.keys(EmotionLabels) as EmotionExpression[]).map((key) => (
              <button
                key={key}
                onClick={() => setEmotion(key)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all
                  ${
                    emotion === key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
          <p className="mb-2 text-sm font-bold">相手の趣味・関心（任意）</p>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="例：音楽、映画、旅行"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        {/* アクション */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
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
            className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-md"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}