/**
 * 图片上传封装
 *
 * 必须单独写,不能复用 utils/request.ts:
 *   - uni.uploadFile 是独立的 multipart API,签名/回调/返回格式都与 uni.request 不同
 *   - uni.uploadFile 的 success.data 是 string(后端响应原文),需要 JSON.parse
 *   - 单文件上传,前端一张图一次调用;批量并发由 uploadImages 包一层 Promise.all
 *
 * 鉴权 & trace:
 *   - 走和 request.ts 一致的 Authorization / X-Trace-Id 注入
 *   - 业务码非 200 抛 BizError(沿用 request.ts 的同一个错误类型,保证调用方 catch 一致)
 *
 * 错误展示:
 *   - 默认 showErrorToast=true,失败时直接 toast 后端 msg(与 request.ts 同款)
 *   - 调用方需要静默处理(如批量上传里逐个吞)可传 false
 */

import { env } from '@/config/env';
import { getToken } from '@/utils/auth';
import { BizError } from '@/utils/request';

export interface UploadResp {
  /** 完整 http(s) URL,直接可作 <image :src> */
  url: string;
  mime: string;
  sizeBytes: number;
}

interface UploadOptions {
  /** 失败时是否自动 Toast(默认 true) */
  showErrorToast?: boolean;
  /** 字段名,默认 file,与后端 FileInterceptor('file') 对齐 */
  name?: string;
}

function genTraceId(): string {
  const t = Date.now().toString(36).slice(-6);
  const r = Math.random().toString(36).slice(2, 6);
  return `u_${t}${r}`;
}

interface UploadEnvelope {
  code: number;
  msg: string;
  data: UploadResp;
  traceId?: string;
}

/** 上传一张图片,返回服务端落盘后的远程 URL */
export function uploadImage(
  localPath: string,
  opts: UploadOptions = {},
): Promise<UploadResp> {
  const { showErrorToast = true, name = 'file' } = opts;
  const token = getToken();
  const traceId = genTraceId();

  return new Promise<UploadResp>((resolve, reject) => {
    uni.uploadFile({
      url: env.apiBaseUrl + '/common/upload',
      filePath: localPath,
      name,
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Trace-Id': traceId,
      },
      success: (res) => {
        // res.data 是字符串,需要 JSON.parse
        let body: UploadEnvelope | null = null;
        try {
          body = JSON.parse(res.data) as UploadEnvelope;
        } catch {
          const err = new BizError(-1, '上传响应解析失败');
          if (showErrorToast) uni.showToast({ title: err.msg, icon: 'none' });
          reject(err);
          return;
        }

        // HTTP 非 2xx
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const msg = (body && body.msg) || `上传失败 (${res.statusCode})`;
          const err = new BizError(res.statusCode, msg, body?.traceId);
          if (showErrorToast) uni.showToast({ title: msg, icon: 'none' });
          reject(err);
          return;
        }

        // 业务码非 200
        if (!body || body.code !== 200) {
          const err = new BizError(
            body?.code ?? -1,
            body?.msg || '上传失败',
            body?.traceId,
          );
          if (showErrorToast) uni.showToast({ title: err.msg, icon: 'none' });
          reject(err);
          return;
        }

        resolve(body.data);
      },
      fail: (err) => {
        const msg = (err && (err as { errMsg?: string }).errMsg) || '网络异常';
        const bizErr = new BizError(-1, msg);
        if (showErrorToast) uni.showToast({ title: msg, icon: 'none' });
        reject(bizErr);
      },
    });
  });
}

/**
 * 批量上传,逐个抛 Promise(失败的那张静默吞掉,不阻塞其它)。
 * 返回成功上传的远程 URL 数组(与输入顺序一致,失败的索引位被剔除)。
 */
export async function uploadImages(localPaths: string[]): Promise<string[]> {
  const results = await Promise.allSettled(
    localPaths.map((p) => uploadImage(p, { showErrorToast: false })),
  );
  const urls: string[] = [];
  let failCount = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') {
      urls.push(r.value.url);
    } else {
      failCount += 1;
    }
  }
  if (failCount > 0) {
    uni.showToast({
      title: `上传失败 ${failCount} 张`,
      icon: 'none',
    });
  }
  return urls;
}
