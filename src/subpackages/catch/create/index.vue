<template>
  <view class="catch-create">
    <mxy-form-nav
      title="发布鱼获"
      left-text="取消"
      action-text="发布"
      @action="onPublish"
    />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 照片 -->
        <view class="card pad">
          <text class="card-title">鱼获照片(至少 1 张)</text>
          <view class="photo-row">
            <view
              v-for="(p, idx) in form.photos"
              :key="idx"
              class="photo-cell"
            >
              <image class="photo-img" :src="p" mode="aspectFill" />
              <view class="photo-del" @click="onDelPhoto(idx)">
                <mxy-icon name="close" :size="22" color="#fff" />
              </view>
            </view>
            <view v-if="form.photos.length < 9" class="photo-add" @click="onAddPhoto">
              <mxy-icon name="add_a_photo" :size="48" color="#6B7B85" />
            </view>
          </view>
        </view>

        <!-- 必填字段 -->
        <view class="card">
          <view class="row" @click="onPickFish">
            <text class="row-label">鱼种</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.fish.join('  ') || '请选择' }}  +</text>
            </view>
          </view>
          <view class="divider" />
          <view class="row weight-row">
            <text class="row-label">重量 / 长度</text>
            <view class="weight-inputs">
              <input
                class="weight-input"
                v-model="form.weight"
                placeholder="重量"
                placeholder-style="color:#99A5AD"
              />
              <text class="weight-sep">/</text>
              <input
                class="weight-input"
                v-model="form.length"
                placeholder="长度"
                placeholder-style="color:#99A5AD"
              />
            </view>
          </view>
          <view class="divider" />
          <view class="row select" @click="onPickSpot">
            <text class="row-label">关联钓点</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.spot }}</text>
              <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
            </view>
          </view>
          <view class="divider" />
          <view class="row select" @click="openMethodSheet">
            <text class="row-label">钓法</text>
            <view class="row-value">
              <text class="row-value-text">{{ form.method }}</text>
              <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
            </view>
          </view>
        </view>

        <!-- 描述 -->
        <view class="card pad">
          <text class="card-title">文字描述</text>
          <textarea
            class="desc-input"
            v-model="form.desc"
            placeholder="今天气压、漂相、钩饵线组、放流情况..."
            placeholder-style="color:#99A5AD"
            maxlength="500"
            auto-height
          />
        </view>

        <!-- 天气 -->
        <view class="weather-card">
          <view class="weather-icon">
            <mxy-icon name="cloud" :size="44" color="#5BA9C4" />
          </view>
          <view class="weather-text">
            <text class="weather-main">自动填充天气</text>
            <text class="weather-sub">{{ weather.text }}</text>
          </view>
          <view class="switch" :class="{ on: weather.auto }" @click="weather.auto = !weather.auto">
            <view class="switch-dot" />
          </view>
        </view>

        <!-- 隐私 -->
        <view class="card">
          <view class="row">
            <text class="row-label">公开钓点位置</text>
            <view class="switch" :class="{ on: form.publicSpot }" @click="form.publicSpot = !form.publicSpot">
              <view class="switch-dot" />
            </view>
          </view>
          <view class="divider" />
          <view class="row">
            <text class="row-label">允许评论</text>
            <view class="switch" :class="{ on: form.allowComment }" @click="form.allowComment = !form.allowComment">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- Design 35: 钓法选择浮层 -->
    <view v-if="methodSheetOpen" class="method-layer">
      <view class="method-scrim" @click="closeMethodSheet" />
      <view class="method-sheet" :style="{ paddingBottom: (safeBottom + 24) + 'px' }">
        <view class="ms-handle" />
        <view class="ms-head">
          <text class="ms-cancel" @click="closeMethodSheet">取消</text>
          <text class="ms-title">选择钓法</text>
          <text class="ms-done" @click="onMethodConfirm">确定</text>
        </view>

        <view class="ms-selected">
          <text class="ms-selected-text">当前选择：{{ pendingMethod }}</text>
          <mxy-icon name="check_circle" :size="44" color="#2D8F87" />
        </view>

        <view class="ms-options">
          <template v-for="(m, idx) in methodOptions" :key="m.name">
            <view
              class="ms-option"
              :class="{ selected: pendingMethod === m.name }"
              @click="onPickMethod(m)"
            >
              <text class="ms-option-text">{{ m.name }}</text>
              <mxy-icon
                v-if="m.isOther"
                name="chevron_right"
                :size="44"
                color="#6B7B85"
              />
              <mxy-icon
                v-else-if="pendingMethod === m.name"
                name="radio_button_checked"
                :size="44"
                color="#2D8F87"
              />
              <mxy-icon
                v-else
                name="radio_button_unchecked"
                :size="44"
                color="#6B7B85"
              />
            </view>
            <view v-if="idx < methodOptions.length - 1" class="ms-option-divider" />
          </template>
        </view>

        <view class="ms-note">
          <mxy-icon name="lightbulb" :size="40" color="#5BA9C4" />
          <text class="ms-note-text">同一套弹层可复用于饵料、隐私、天气、鱼情等选项</text>
        </view>
        <view class="ms-safe" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  createCatch,
  parseWeightInputToG,
  parseLengthInputToCm,
  type Technique,
} from '@/api/catches';
import { fetchFishingIndex, formatWeatherLine, type FishingIndex } from '@/api/weather';
import { uploadImages } from '@/utils/upload';
import { BizError } from '@/utils/request';

const { safeBottom } = useSystemInfo();

interface MethodOption {
  name: string;
  isOther?: boolean;
}
const methodOptions: MethodOption[] = [
  { name: '台钓' },
  { name: '路亚' },
  { name: '矶钓' },
  { name: '海竿' },
  { name: '其他钓法', isOther: true },
];

/** 中文钓法名 → 后端 technique 枚举（hand/taiwan/lure/sea/other） */
function methodToTechnique(m: string): Technique {
  if (m === '台钓') return 'taiwan';
  if (m === '路亚') return 'lure';
  if (m === '矶钓' || m === '海竿') return 'sea';
  if (m === '其他钓法') return 'other';
  return 'other';
}

const form = ref({
  photos: [] as string[],
  fish: [] as string[],
  weight: '',
  length: '',
  spot: '未关联钓点',
  /** 关联钓点的 id；spot-picker 页面回填到此 */
  spotId: '' as string,
  method: '台钓',
  desc: '',
  publicSpot: true,
  allowComment: true,
});

const weather = ref({
  auto: true,
  text: '正在获取天气...',
});

const submitting = ref(false);
const uploading = ref(false);
const currentLocation = ref<{ lat: number; lng: number } | null>(null);
const weatherSnapshot = ref<FishingIndex | null>(null);

/* ---------- 钓法弹层 (Design 35) ---------- */
const methodSheetOpen = ref(false);
const pendingMethod = ref(form.value.method);

const openMethodSheet = () => {
  pendingMethod.value = form.value.method;
  methodSheetOpen.value = true;
};
const closeMethodSheet = () => { methodSheetOpen.value = false; };
const onPickMethod = (m: MethodOption) => {
  if (m.isOther) {
    uni.showModal({
      title: '输入钓法',
      placeholderText: '如 矶筏、滩钓',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) pendingMethod.value = res.content;
      },
    });
    return;
  }
  pendingMethod.value = m.name;
};
const onMethodConfirm = () => {
  form.value.method = pendingMethod.value;
  methodSheetOpen.value = false;
};

const onPickFish = () => {
  uni.navigateTo({
    url: '/subpackages/catch/fish-picker/index',
    events: {
      fishSelected(data: unknown) {
        if (Array.isArray(data)) {
          form.value.fish = data.filter((x): x is string => typeof x === 'string');
        }
      },
    },
    success: (res) => {
      // 把当前已选鱼种带过去做回显
      res.eventChannel?.emit?.('initFish', [...form.value.fish]);
    },
  });
};
const onPickSpot = () => {
  uni.navigateTo({
    url: '/subpackages/catch/spot-picker/index',
    events: {
      spotSelected(data: unknown) {
        if (data && typeof data === 'object') {
          const d = data as { id?: unknown; name?: unknown };
          if (typeof d.id === 'string' && typeof d.name === 'string') {
            form.value.spotId = d.id;
            form.value.spot = d.name;
          }
        }
      },
    },
    success: (res) => {
      if (form.value.spotId) {
        res.eventChannel?.emit?.('initSpot', { id: form.value.spotId, name: form.value.spot });
      }
    },
  });
};
const onAddPhoto = () => {
  if (uploading.value) return;
  uni.chooseImage({
    count: 9 - form.value.photos.length,
    success: async (res) => {
      // uni-app 在不同平台返回 string | string[],统一归一化
      const paths = Array.isArray(res.tempFilePaths)
        ? res.tempFilePaths
        : res.tempFilePaths
          ? [res.tempFilePaths]
          : [];
      if (!paths.length) return;
      uploading.value = true;
      uni.showLoading({ title: '上传中...' });
      try {
        const urls = await uploadImages(paths);
        if (urls.length) form.value.photos.push(...urls);
      } finally {
        uni.hideLoading();
        uploading.value = false;
      }
    },
  });
};
const onDelPhoto = (idx: number) => form.value.photos.splice(idx, 1);

async function loadWeather() {
  try {
    const loc: any = await new Promise((resolve, reject) =>
      uni.getLocation({ type: 'gcj02', isHighAccuracy: true, success: resolve, fail: reject }),
    );
    currentLocation.value = { lat: loc.latitude, lng: loc.longitude };
    const data = await fetchFishingIndex({
      lat: loc.latitude,
      lng: loc.longitude,
    });
    weatherSnapshot.value = data;
    weather.value.text = formatWeatherLine(data);
  } catch (_) {
    weather.value.text = '未获取天气';
  }
}

onMounted(() => {
  void loadWeather();
});

async function onPublish() {
  if (submitting.value) return;
  if (form.value.photos.length === 0) {
    uni.showToast({ title: '至少上传 1 张照片', icon: 'none' });
    return;
  }
  if (form.value.fish.length === 0) {
    uni.showToast({ title: '请选择鱼种', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    const resp = await createCatch({
      photos: form.value.photos,
      fishSpecies: form.value.fish,
      weight: parseWeightInputToG(form.value.weight),
      length: parseLengthInputToCm(form.value.length),
      technique: methodToTechnique(form.value.method),
      content: form.value.desc || undefined,
      spotId: form.value.spotId || undefined,
      lat: currentLocation.value?.lat,
      lng: currentLocation.value?.lng,
      locationVisible: form.value.publicSpot,
      allowComments: form.value.allowComment,
      weatherSnapshot: weather.value.auto ? (weatherSnapshot.value as unknown as Record<string, unknown> | null) ?? undefined : undefined,
    });
    uni.showToast({ title: '已发布', icon: 'success' });
    setTimeout(() => {
      uni.redirectTo({
        url: `/subpackages/catch/detail/index?id=${resp.id}`,
      });
    }, 600);
  } catch (e) {
    console.warn('[catch-create] publish failed', e);
    const msg = e instanceof BizError ? e.msg : '发布失败,请稍后重试';
    uni.showToast({ title: msg, icon: 'none', duration: 2500 });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
