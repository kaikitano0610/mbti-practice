export type Situation = {
	id: string;
	label: string;
	point: string;
};

export const Situations: Situation[] = [
  {
    id: "listening_to_work_complaint",
    label: "今日仕事でこんなことがあって！って愚痴を言われた時",
    point: "共感を優先し、アドバイスせずに聞き手に回れているか",
  },
  {
    id: "respond_to_lonely_feeling",
    label: "最近あんまり会えてなくて寂しいって言われた時",
    point: "言い訳せず、相手の気持ちを受け止めた立ち回りができているか",
  },
  {
    id: "gentle_check_in",
    label: "なんか元気なくない？って感じた時の声かけ",
    point: "踏み込みすぎず、相手の距離感に合わせられているか",
  },
  {
    id: "plan_next_date",
    label: "次いつ会う？って自然に予定を決めたい時",
    point: "主導しすぎず、相手のペースを尊重した提案ができているか",
  },
  {
    id: "natural_confession_flow",
    label: "自然な流れで気持ちを伝えたいな…って思った時",
    point: "唐突にならず、相手の温度感を読めているか",
  },
  {
    id: "asking_about_crush",
    label: "好きな人とかいるのかな…って探りたくなった時",
    point: "詮索にならず、安心感のある聞き方ができているか",
  },
];