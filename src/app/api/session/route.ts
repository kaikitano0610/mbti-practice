import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 【修正1】 APIキーがあるか最初にチェックする
    // これがないと、キーが読み込めていない時に "Bearer undefined" という文字列を送ってしまいエラーになる
    if (!process.env.OPENAI_API_KEY) {
      console.error("Server Error: OPENAI_API_KEY is not set.");
      return NextResponse.json({ error: "API Key is missing on Server" }, { status: 500 });
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 【修正2】 確実に動いていたモデル名に戻す（ここを変えると動かない可能性がある）
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse", // 必要であればvoiceも指定
        }),
      }
    );

    // 【修正3】 OpenAIからのレスポンスがエラー（401や500）だった場合の処理
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}