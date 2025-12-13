export type PartnerName = string;
export type PartnerPronoun = string;
export type Relationship = "crush" | "dating_new" | "dating_long";
export type EmotionExpression = "reserved" | "expressive";
export type Interests = string;

export type AdditionalContext = {
	partnerName: PartnerName;
	partnerPronoun: PartnerPronoun;
	relationship: Relationship;
	emotion: EmotionExpression;
	interests: Interests;
};

export const RelationshipLabels: Record<Relationship, string> = {
	crush: "気になっている",
	dating_new: "付き合い始めたばかり",
	dating_long: "長く付き合っている",
}

export const EmotionLabels: Record<EmotionExpression, string> = {
	reserved: "あまり表に出さない",
	expressive: "言葉にして伝えることが多い",
}