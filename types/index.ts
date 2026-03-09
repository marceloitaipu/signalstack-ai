/**
 * Tipos compartilhados do SignalStack AI
 * Re-exporta os tipos do Prisma para conveniência
 */
export type { Plan, UserRole, AlertChannel, AlertSeverity, DeliveryStatus } from '@prisma/client';
export type { SessionPayload } from '../lib/auth';
export type { Candle } from '../lib/market';

/** Resposta padrão da API */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

/** Signal gerado pelo motor de indicadores */
export type Signal = {
  side: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  thesis: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  indicators: {
    emaFast: number;
    emaSlow: number;
    rsi: number;
    atr: number;
    volumeSpike: boolean;
  };
};

/** Snapshot de mercado */
export type MarketSnapshot = {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
};
