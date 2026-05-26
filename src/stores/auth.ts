/**
 * 鉴权 store
 *
 * 单一职责:管理「登录态 + 用户资料」的响应式内存层。
 * 持久化沿用 utils/auth.ts 的 `yg_token` / `yg_user` 两个 storage key
 * (不切到 pinia 默认 key 的目的:已登录用户升级版本后不会被强制踢下线)。
 *
 * 调用约定:
 *   - 登录:`authStore.login(token, refreshToken, userSnapshot)` — 一步到位写内存 + storage
 *   - 退出:`authStore.logout()` 或 utils/auth.logout() 任一,二者等价
 *   - 拉资料:`await authStore.refreshMe()` — 拉一次 /users/me 并写到 profile.value
 *   - 局部更新:`authStore.patchProfile({ nickname: '...' })` — 编辑页保存后不重拉
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  type AuthUser,
  clearRefreshToken,
  clearToken,
  clearUser,
  getToken,
  getUser,
  onAuthLogout,
  setRefreshToken,
  setToken,
  setUser,
} from '@/utils/auth';
import { fetchMe, type MeProfile } from '@/api/users';

export const useAuthStore = defineStore('auth', () => {
  // ─── 状态(hydrate from storage on init,在 setupPinia 之后第一次 useStore 时跑一次)
  const token = ref<string>(getToken());
  const user = ref<AuthUser | null>(getUser());
  // /users/me 完整资料,只在需要时拉一次;登录卡片/编辑页都消费这个
  const profile = ref<MeProfile | null>(null);
  const profileLoading = ref(false);

  // ─── getter
  const isLoggedIn = computed(() => !!token.value);
  const displayName = computed(() => {
    if (profile.value?.nickname) return profile.value.nickname;
    if (user.value?.nickname) return user.value.nickname;
    const id = profile.value?.id || user.value?.id;
    return id ? `钓友${String(id).slice(-4)}` : '未登录';
  });
  const avatar = computed(
    () => profile.value?.avatar || user.value?.avatar || '',
  );

  // ─── actions
  function login(newToken: string, newRefreshToken: string, newUser: AuthUser): void {
    token.value = newToken;
    user.value = newUser;
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);
  }

  /** 主动退出:清内存 + storage,不触发 logout 事件(避免和外部监听回环) */
  function logout(): void {
    token.value = '';
    user.value = null;
    profile.value = null;
    clearToken();
    clearRefreshToken();
    clearUser();
  }

  async function refreshMe(force = false): Promise<MeProfile | null> {
    if (!isLoggedIn.value) return null;
    if (profileLoading.value && !force) return profile.value;
    profileLoading.value = true;
    try {
      const me = await fetchMe();
      profile.value = me;
      // 同步轻量快照(供下次启动 hydrate)
      const snap: AuthUser = {
        id: me.id,
        openid: me.openid,
        nickname: me.nickname,
        avatar: me.avatar,
      };
      user.value = snap;
      setUser(snap);
      return me;
    } catch (e) {
      // request.ts 已弹 Toast / 401 已跳登录,这里只兜底
      console.warn('[auth] refreshMe failed', e);
      return null;
    } finally {
      profileLoading.value = false;
    }
  }

  /** 编辑页保存成功后,把 update 返回的最新字段灌进来,避免再发一次 /users/me */
  function patchProfile(partial: Partial<MeProfile>): void {
    if (!profile.value) {
      // 没拉过 me,partial 不够完整就别强塞;让消费方下次 refreshMe
      return;
    }
    profile.value = { ...profile.value, ...partial };
    if (
      partial.nickname !== undefined ||
      partial.avatar !== undefined
    ) {
      const snap: AuthUser = {
        id: profile.value.id,
        openid: profile.value.openid,
        nickname: profile.value.nickname,
        avatar: profile.value.avatar,
      };
      user.value = snap;
      setUser(snap);
    }
  }

  // ─── 订阅 utils/auth.logout() — 把 401 等"外部"退出也同步到内存
  onAuthLogout(() => {
    if (token.value || user.value || profile.value) {
      token.value = '';
      user.value = null;
      profile.value = null;
    }
  });

  return {
    token,
    user,
    profile,
    profileLoading,
    isLoggedIn,
    displayName,
    avatar,
    login,
    logout,
    refreshMe,
    patchProfile,
  };
});
