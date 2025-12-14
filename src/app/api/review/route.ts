import { NextResponse } from 'next/server';
import OpenAI from 'openai';


export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const { 
      history, agentMBTI, agentBasePrompt, situationText, 
      aiEmotion, aiInterests, userRelationship, aiName
    } = await req.json();

    const systemPrompt = `
    あなたは恋愛シミュレーションの「心の動きをそっと言語化する実況者」です。
    会話ログには【ユーザー】と【相手】の発言が記録されています。
    会話を評価・採点する立場ではなく、相手（${agentMBTI}タイプ）の心の中で
    「何が起きたか」を静かに描写してください。

    「評価」「正解」「適切」「良かった」など、
    上から目線や講評に聞こえる言葉は一切使わないでください。

    【対象データ】
    相手の名前: ${aiName}
    相手の性格タイプ: ${agentMBTI}

    [相手の基本性格情報]
    ${agentBasePrompt}

    ［その他の情報］
    感情表現: ${aiEmotion}
    趣味: ${aiInterests}
    状況: ${situationText}
    関係性: ${userRelationship}

    【出力項目ルール（厳守）】

    1. **score**  
    0〜100の数値で表す「心の距離の近さ（恋愛的な好意の温度）」。

    - 冷たい・突き放す・軽視する発言があった場合は、
    好意が一気に下がってもよい。
    - 必ずしも高得点にする必要はない。
    - 違和感・引っかかり・壁が生まれた場合は、低めの数値を選ぶ。

    2. **mbti_insight**  
    この状況での${agentMBTI}タイプ特有の思考回路や心理状態を、
    「〜と感じやすい」「〜と考えがち」といった表現で説明する。
    分析しすぎず、感情寄りで。

    3. **comment**（最重要）  
    - ユーザーを評価・批評しない。
    - 実際のセリフを引用し、
    その言葉によって相手の心がどう揺れたかを書く。
    - 感情を主語にする。
    （例：「安心感が生まれました」ではなく
            「安心感が静かに広がっていきました」）
    - 第三者が心の中をのぞいて言葉にしているようなトーンにする。

    4. **best_response**  
    - これは **「ユーザーが次に言えたら、相手の心が少し動きやすくなるセリフ」**。
    - 相手（AI）の独白や感想にしない。
    - 教科書的・万能な言い回しは禁止。
    ★重要: 相手の名前（${aiName}）を自然に呼ぶことで親密度が増すなら、積極的に名前を含めてください。
       （例：「${aiName}、ありがとう」など）
    - ${agentMBTI}の性格が嬉しい気持ちになる言葉を選ぶ。

    5. **ng_response**  
    この性格・状況で、言われると心に引っかかりやすい言葉。

    6. **ng_reason**  
    「ダメだから」ではなく、
    「そう言われると〜と感じてしまい、
    　無意識に距離を取ってしまいそう」
    という感情の動きで説明する。

    出力形式(JSON):
    {
    "score": number,
    "mbti_insight": string,
    "comment": string,
    "best_response": string,
    "ng_response": string,
    "ng_reason": string
    }
    `;



    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `会話ログ:\n${history}` }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error("Review API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}