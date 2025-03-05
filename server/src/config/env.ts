import dotenv from 'dotenv';

dotenv.config();

export const config = {
  SERPER_API_KEY: process.env.SERPER_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export type Config = typeof config;