// src/app/characters/index.ts

import { ISTJData } from './ISTJ';
import { ISFJData } from './ISFJ';
import { INFJData } from './INFJ';
import { INTJData } from './INTJ';
import { ISTPData } from './ISTP';
import { ISFPData } from './ISFP';
import { INFPData } from './INFP';
import { INTPData } from './INTP';
import { ESTPData } from './ESTP';
import { ESFPData } from './ESFP';
import { ENFPData } from './ENFP';
import { ENTPData } from './ENTP';
import { ESTJData } from './ESTJ';
import { ESFJData } from './ESFJ';
import { ENFJData } from './ENFJ';
import { ENTJData } from './ENTJ';

// 全キャラをまとめる
export const characters: Record<string, typeof ESTPData> = {
  ISTJ: ISTJData,
  ISFJ: ISFJData,
  INFJ: INFJData,
  INTJ: INTJData,
  ISTP: ISTPData,
  ISFP: ISFPData,
  INFP: INFPData,
  INTP: INTPData,
  ESTP: ESTPData,
  ESFP: ESFPData,
  ENFP: ENFPData,
  ENTP: ENTPData,
  ESTJ: ESTJData,
  ESFJ: ESFJData,
  ENFJ: ENFJData,
  ENTJ: ENTJData,
};

// デフォルトキャラ（エラー回避用）
export const defaultCharacter = ESTPData;