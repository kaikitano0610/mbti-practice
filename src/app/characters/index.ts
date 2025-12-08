import { RealtimeAgent } from '@openai/agents/realtime';

// 最低限のシンプルエージェント定義
export const demoAgent = new RealtimeAgent({
  name: 'Demo Agent',
  instructions: 'You are a helpful AI assistant. Please respond concisely.',
  voice: 'alloy',
});

// App.tsxで読み込むためのエクスポート
export const defaultAgentSet = [demoAgent];