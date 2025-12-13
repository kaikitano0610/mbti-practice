"use client";
import React from "react";
import { Situation, Situations } from "../lib/situations";

type Props = {
	isOpen: boolean;
	situation: string;
	onClose: () => void;
	onSelect: (value: string) => void;
};

export default function SituationModal({ isOpen, situation, onClose, onSelect }: Props) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50"
				onClick={onClose}
			/>
			<div className="relative bg-white rounded-xl p-20 z-10">
				<h2 className="text-xl font-bold mb-4 text-center">シチュエーション選択</h2>

				<select 
					value={situation}
					onChange={(e) => onSelect(e.target.value)}
					className="w-full border-2 border-black rounded-lg p-3 text-lg"
					>
						{Situations.map((s) => (
							<option key={s.id} value={s.id}>
								{s.label}
							</option>
						))}
					</select>

					<button
						onClick={onClose}
						className="mt-6 w-full bg-black text-white py-3 rounded-lg font-bold"
					>
						決定
					</button>
			</div>
		</div>
	)
}