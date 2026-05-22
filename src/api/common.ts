/**
 * /common/config 接口的前端类型定义和封装
 *
 * 对应后端 modules/common/common.controller.ts
 * 公开接口（无需登录）
 */

import { http } from '@/utils/request';

export interface AppConfig {
  version: string;
  env: string;
  features: Record<string, boolean>;
  upload: {
    maxImageMB: number;
    accept: string[];
  };
  dicts: Record<string, string[]>;
  /** ISO 时间串 */
  serverTime: string;
}

export function fetchAppConfig(): Promise<AppConfig> {
  return http.post<AppConfig>('/common/config', undefined, { skipAuth: true, showErrorToast: false });
}
