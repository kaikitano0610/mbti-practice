import { useCallback, useRef, useState, useEffect } from 'react';
import {
  RealtimeSession,
  RealtimeAgent,
  OpenAIRealtimeWebRTC,
} from '@openai/agents/realtime';
import { SessionStatus } from '../types';

export interface RealtimeSessionCallbacks {
  onConnectionChange?: (status: SessionStatus) => void;
}

export interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  initialAgents: RealtimeAgent[];
  audioElement?: HTMLAudioElement;
  extraContext?: Record<string, any>;
  onMessageCreated?: (id: string, role: "user" | "assistant", text: string) => void;
  onMessageUpdated?: (id: string, text: string, isDelta: boolean) => void;
}

export function useRealtimeSession(callbacks: RealtimeSessionCallbacks = {}) {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');

  const updateStatus = useCallback(
    (s: SessionStatus) => {
      setStatus(s);
      callbacks.onConnectionChange?.(s);
    },
    [callbacks],
  );

  useEffect(() => {
    if (sessionRef.current) {
      // エラーハンドリング
      sessionRef.current.on("error", (error: any) => {
        console.error("Session Error:", error);
      });
    }
  }, []); // sessionRef.currentは可変なので依存配列は空でOK

  const connect = useCallback(
    async ({
      getEphemeralKey,
      initialAgents,
      audioElement,
      extraContext,
      onMessageCreated,
      onMessageUpdated,
    }: ConnectOptions) => {
      if (sessionRef.current) return;

      updateStatus('CONNECTING');

      try {
        const ek = await getEphemeralKey();
        const rootAgent = initialAgents[0];

        sessionRef.current = new RealtimeSession(rootAgent, {
          transport: new OpenAIRealtimeWebRTC({
            audioElement,
          }),
          model: 'gpt-4o-realtime-preview-2025-06-03',
          config: {
            inputAudioTranscription: {
              model: 'gpt-4o-mini-transcribe',
            },
          },
          context: extraContext ?? {},
        });

        // -----------------------------------------------------------
        // 修正ポイント：すべてのイベントを 'transport_event' で受け取る
        // -----------------------------------------------------------
        sessionRef.current.on('transport_event', (event: any) => {
          switch (event.type) {
            // 1. 新しい会話アイテム（吹き出し）が作成された
            case 'conversation.item.created': {
              const { item } = event;
              if (item.type === 'message') {
                let text = "";
                if (item.content && item.content[0]?.type === 'text') {
                  text = item.content[0].text || "";
                }
                onMessageCreated?.(item.id, item.role, text);
              }
              break;
            }

            // 2. ユーザーの音声認識が完了してテキストが確定した
            case 'conversation.item.input_audio_transcription.completed': {
              const { item_id, transcript } = event;
              onMessageUpdated?.(item_id, transcript, false);
              break;
            }

            // 3. AIの返答が生成されている途中（ストリーミング）
            case 'response.audio_transcript.delta': {
              const { item_id, delta } = event;
              onMessageUpdated?.(item_id, delta, true);
              break;
            }
            
            // 4. AIのテキスト生成完了（念のため）
            case 'response.text.done': {
              const { item_id, text } = event;
              onMessageUpdated?.(item_id, text, false);
              break;
            }
          }
        });

        await sessionRef.current.connect({ apiKey: ek });
        updateStatus('CONNECTED');
      } catch (err) {
        console.error("Failed to connect:", err);
        updateStatus('DISCONNECTED');
        sessionRef.current = null;
      }
    },
    [callbacks, updateStatus],
  );

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    updateStatus('DISCONNECTED');
  }, [updateStatus]);

  const assertConnected = () => {
    if (!sessionRef.current) {
      console.warn('RealtimeSession not connected');
      return false;
    }
    return true;
  };

  const interrupt = useCallback(() => {
    if(sessionRef.current) sessionRef.current.interrupt();
  }, []);
  
  const sendUserText = useCallback((text: string) => {
    if(assertConnected()) {
        sessionRef.current!.sendMessage(text);
    }
  }, []);

  const sendEvent = useCallback((ev: any) => {
    sessionRef.current?.transport.sendEvent(ev);
  }, []);

  const mute = useCallback((m: boolean) => {
    sessionRef.current?.mute(m);
  }, []);

  return {
    status,
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    mute,
    interrupt,
  } as const;
}