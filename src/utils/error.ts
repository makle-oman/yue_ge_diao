const ERROR_MESSAGE_BY_CODE: Record<number, string> = {
  400: '请求参数有误',
  401: '登录已过期，请重新登录',
  403: '暂无操作权限',
  404: '内容不存在或已失效',
  409: '当前状态不允许重复操作',
  413: '文件过大，请重新选择',
  429: '操作太频繁，请稍后再试',
  500: '服务暂时不可用，请稍后再试',
};

export function resolveErrorMessage(code: number, msg?: string): string {
  const text = msg?.trim();
  if (code === 401 || code === 500) return ERROR_MESSAGE_BY_CODE[code];
  if (code === -1 && (!text || /^request:fail/i.test(text) || /timeout/i.test(text))) {
    return '网络异常，请稍后再试';
  }
  return text || ERROR_MESSAGE_BY_CODE[code] || '操作失败，请稍后再试';
}
