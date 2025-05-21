// src/types/global.d.ts

declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      role: string;
    };
  }
}
