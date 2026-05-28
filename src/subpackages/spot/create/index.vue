<template>
  <view class="spot-create">
    <mxy-form-nav title="上报新钓点" action-text="提交" @action="onSubmit" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 现场定位 -->
        <view class="loc-card">
          <view class="loc-map">
            <view class="loc-river" />
            <view class="loc-dot" />
            <text class="loc-title">{{ locTitle }}</text>
          </view>
          <view class="loc-row">
            <view class="loc-acc">
              <mxy-icon :name="locOk ? 'check_circle' : 'error_outline'" :size="24" :color="locOk ? '#2D8F87' : '#F5A623'" />
              <text class="loc-acc-text">{{ locHint }}</text>
            </view>
            <view class="loc-relocate" @click="onRelocate">
              <text>重新定位</text>
            </view>
          </view>
        </view>

        <!-- 基础信息 -->
        <view class="card">
          <view class="row">
            <text class="row-label">钓点名称</text>
            <input
              class="row-input"
              v-model="form.name"
              placeholder="请输入钓点名称"
              placeholder-style="color:#99A5AD"
            />
          </view>
          <view class="divider" />
          <view class="row select" @click="onPickType">
            <text class="row-label">钓点类型</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.type }}</text>
              <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
            </view>
          </view>
          <view class="divider" />
          <view class="row select" @click="onPickWater">
            <text class="row-label">水域类型</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.water }}</text>
              <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
            </view>
          </view>
          <view class="divider" />
          <view class="row fish">
            <text class="row-label">主要鱼种</text>
            <view class="fish-chips">
              <view
                v-for="(f, idx) in form.fish"
                :key="f"
                class="fish-chip"
                :class="`tone-${idx % 3}`"
                @click="onRemoveFish(idx)"
              >
                <text>{{ f }}</text>
              </view>
              <view class="fish-chip add" @click="onAddFish">
                <mxy-icon name="add" :size="28" color="#6B7B85" />
              </view>
            </view>
          </view>
        </view>

        <!-- 现场条件 -->
        <view class="card pad">
          <text class="card-title">现场条件</text>
          <view class="cond-chips">
            <view
              v-for="c in conditions"
              :key="c.key"
              class="cond-chip"
              :class="{ active: form.conditions.includes(c.key) }"
              @click="toggleCondition(c.key)"
            >
              <text>{{ c.label }}</text>
            </view>
          </view>
        </view>

        <!-- 现场照片 -->
        <view class="card pad">
          <text class="card-title">现场照片</text>
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
              <mxy-icon name="add_a_photo" :size="44" color="#6B7B85" />
            </view>
          </view>
          <text class="photo-tip">现场照片最多 9 张，建议包含水面、岸边、停车位置。</text>
        </view>

        <!-- 补充说明 -->
        <view class="card pad">
          <text class="card-title">补充说明</text>
          <textarea
            class="desc-input"
            v-model="form.desc"
            placeholder="缓流、早晚窗口、注意事项等..."
            placeholder-style="color:#99A5AD"
            maxlength="200"
            auto-height
          />
        </view>

      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" @click="onSubmit">
        <text class="submit-btn-text">提交钓点,等待审核</text>
      </view>
    </view>

    <!-- 钓点类型 Sheet -->
    <mxy-bottom-sheet
      v-model:visible="typeOpen"
      title="钓点类型"
      @done="onTypeDone"
    >
      <view class="picker-current">
        <text class="picker-current-text">当前选择：{{ form.type }}</text>
        <mxy-icon name="check_circle" :size="40" color="#2D8F87" />
      </view>

      <view class="picker-options-card">
        <view v-for="(opt, i) in typeOptions" :key="opt.value">
          <view class="picker-option" @click="draftType = opt.value">
            <view class="picker-option-left">
              <mxy-icon :name="opt.icon" :size="40" :color="opt.value === draftType ? '#2D8F87' : '#6B7B85'" />
              <text class="picker-option-text" :class="{ active: opt.value === draftType }">{{ opt.label }}</text>
            </view>
            <mxy-icon
              :name="opt.value === draftType ? 'check_circle' : 'radio_button_unchecked'"
              :size="40"
              :color="opt.value === draftType ? '#2D8F87' : '#99A5AD'"
            />
          </view>
          <view v-if="i !== typeOptions.length - 1" class="picker-divider" />
        </view>
      </view>

      <view class="picker-tip">
        <mxy-icon name="info" :size="36" color="#5BA9C4" />
        <text class="picker-tip-text">不同钓点类型决定后续筛选规则与是否需要付费提示，提交后由审核确认。</text>
      </view>
    </mxy-bottom-sheet>

    <!-- 水域类型 Sheet -->
    <mxy-bottom-sheet
      v-model:visible="waterOpen"
      title="水域类型"
      @done="onWaterDone"
    >
      <view class="picker-current">
        <text class="picker-current-text">当前选择：{{ form.water }}</text>
        <mxy-icon name="check_circle" :size="40" color="#2D8F87" />
      </view>

      <view class="picker-options-card">
        <view v-for="(opt, i) in waterOptions" :key="opt.value">
          <view class="picker-option" @click="draftWater = opt.value">
            <view class="picker-option-left">
              <mxy-icon :name="opt.icon" :size="40" :color="opt.value === draftWater ? '#2D8F87' : '#6B7B85'" />
              <text class="picker-option-text" :class="{ active: opt.value === draftWater }">{{ opt.label }}</text>
            </view>
            <mxy-icon
              :name="opt.value === draftWater ? 'check_circle' : 'radio_button_unchecked'"
              :size="40"
              :color="opt.value === draftWater ? '#2D8F87' : '#99A5AD'"
            />
          </view>
          <view v-if="i !== waterOptions.length - 1" class="picker-divider" />
        </view>
      </view>

      <view class="picker-tip">
        <mxy-icon name="water" :size="36" color="#5BA9C4" />
        <text class="picker-tip-text">水域类型用于天气与潮汐适配，海钓将额外展示风浪与潮位窗口。</text>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import {
  createSpot,
  SPOT_TYPE_LABEL,
  WATER_TYPE_LABEL,
  type SpotType,
  type WaterType,
} from '@/api/spots';
import { uploadImages } from '@/utils/upload';

const { safeBottom } = useSystemInfo();

const ACCURACY_LIMIT = 50;

const accuracy = ref<number>(0);
const lat = ref<number>(0);
const lng = ref<number>(0);
const submitting = ref(false);

const locOk = computed(() => accuracy.value > 0 && accuracy.value <= ACCURACY_LIMIT);
const locTitle = computed(() => {
  if (accuracy.value === 0) return '正在获取定位…';
  if (locOk.value) return '现场定位已通过';
  return '当前精度偏低';
});
const locHint = computed(() => {
  if (accuracy.value === 0) return '请稍候，正在获取经纬度';
  if (locOk.value) return `精度 ${accuracy.value}m，可上报`;
  return `精度 ${accuracy.value}m，需 <${ACCURACY_LIMIT}m`;
});

const conditions = [
  { key: 'park',   label: '可停车' },
  { key: 'toilet', label: '有厕所' },
  { key: 'shade',  label: '有遮阴' },
  { key: 'slip',   label: '防滑岸' },
  { key: 'night',  label: '可夜钓' },
];

type SpotTypeKey = '野钓点' | '黑坑' | '收费塘' | '海钓';
type WaterTypeKey = '江河' | '湖泊' | '水库' | '池塘' | '海域';

const TYPE_LABEL_TO_CODE: Record<SpotTypeKey, SpotType> = {
  '野钓点': 'wild',
  '黑坑': 'black',
  '收费塘': 'paid',
  '海钓': 'sea',
};
const WATER_LABEL_TO_CODE: Record<WaterTypeKey, WaterType> = {
  '江河': 'river',
  '湖泊': 'lake',
  '水库': 'reservoir',
  '池塘': 'pond',
  '海域': 'sea',
};

const form = ref({
  name: '',
  type: '野钓点' as SpotTypeKey,
  typeCode: 'wild' as SpotType,
  water: '江河' as WaterTypeKey,
  waterCode: 'river' as WaterType,
  fish: [] as string[],
  conditions: [] as string[],
  photos: [] as string[],
  desc: '',
});

const toggleCondition = (k: string) => {
  const idx = form.value.conditions.indexOf(k);
  if (idx >= 0) form.value.conditions.splice(idx, 1);
  else form.value.conditions.push(k);
};

/** 真正调 uni.getLocation 拿经纬度+精度。失败给 toast 不阻塞。 */
async function fetchLocation(silent = false) {
  if (!silent) uni.showLoading({ title: '定位中...' });
  try {
    const loc: any = await new Promise((resolve, reject) =>
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 4000,
        success: resolve,
        fail: reject,
      }),
    );
    lat.value = loc.latitude;
    lng.value = loc.longitude;
    accuracy.value = Math.round(loc.accuracy ?? 0);
    if (!silent) {
      uni.hideLoading();
      if (accuracy.value > ACCURACY_LIMIT) {
        uni.showToast({ title: `精度 ${accuracy.value}m 偏低，请到开阔处再试`, icon: 'none' });
      } else {
        uni.showToast({ title: `精度 ${accuracy.value}m`, icon: 'success' });
      }
    }
  } catch (_) {
    if (!silent) {
      uni.hideLoading();
      uni.showToast({ title: '定位失败', icon: 'none' });
    }
  }
}

onLoad(() => { fetchLocation(true); });

const onRelocate = () => fetchLocation(false);
const onPickType = () => {
  draftType.value = form.value.type;
  typeOpen.value = true;
};
const onPickWater = () => {
  draftWater.value = form.value.water;
  waterOpen.value = true;
};

const typeOptions: { value: SpotTypeKey; label: SpotTypeKey; icon: string }[] = [
  { value: '野钓点', label: '野钓点', icon: 'nature' },
  { value: '黑坑',   label: '黑坑',   icon: 'pool' },
  { value: '收费塘', label: '收费塘', icon: 'payments' },
  { value: '海钓',   label: '海钓',   icon: 'sailing' },
];
const waterOptions: { value: WaterTypeKey; label: WaterTypeKey; icon: string }[] = [
  { value: '江河', label: '江河', icon: 'waves' },
  { value: '湖泊', label: '湖泊', icon: 'water_drop' },
  { value: '水库', label: '水库', icon: 'water' },
  { value: '池塘', label: '池塘', icon: 'water_drop' },
  { value: '海域', label: '海域', icon: 'sailing' },
];

const typeOpen = ref(false);
const waterOpen = ref(false);
const draftType = ref<SpotTypeKey>('野钓点');
const draftWater = ref<WaterTypeKey>('江河');

const onTypeDone = () => {
  form.value.type = draftType.value;
  form.value.typeCode = TYPE_LABEL_TO_CODE[draftType.value];
  typeOpen.value = false;
};
const onWaterDone = () => {
  form.value.water = draftWater.value;
  form.value.waterCode = WATER_LABEL_TO_CODE[draftWater.value];
  waterOpen.value = false;
};

const onAddFish = () => {
  uni.showModal({
    title: '添加鱼种',
    editable: true,
    placeholderText: '如 鲫鱼 / 鲤鱼 / 翘嘴',
    success: (res) => {
      if (res.confirm) {
        const value = (res.content || '').trim();
        if (value && !form.value.fish.includes(value)) {
          form.value.fish.push(value);
        }
      }
    },
  });
};
const onRemoveFish = (idx: number) => form.value.fish.splice(idx, 1);

const uploading = ref(false);

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

const onSubmit = async () => {
  if (submitting.value) return;
  const name = form.value.name.trim();
  if (!name) {
    uni.showToast({ title: '请填写钓点名称', icon: 'none' });
    return;
  }
  if (!lat.value || !lng.value) {
    uni.showToast({ title: '请先完成定位', icon: 'none' });
    return;
  }
  if (accuracy.value > ACCURACY_LIMIT) {
    uni.showToast({ title: `定位精度 ${accuracy.value}m，需 <${ACCURACY_LIMIT}m 才可上报`, icon: 'none' });
    return;
  }

  const facilities: Record<string, boolean> = {};
  for (const k of form.value.conditions) facilities[k] = true;
  // 收费塘类型默认带 paid:true，便于搜索 hasParking/hasToilet 之外的复合查询
  if (form.value.typeCode === 'paid') facilities.paid = true;

  submitting.value = true;
  uni.showLoading({ title: '提交中...' });
  try {
    const resp = await createSpot({
      name,
      type: form.value.typeCode,
      waterType: form.value.waterCode,
      lat: lat.value,
      lng: lng.value,
      accuracy: accuracy.value,
      city: undefined,
      description: form.value.desc.trim() || undefined,
      fishSpecies: form.value.fish.length ? form.value.fish : undefined,
      facilities: Object.keys(facilities).length ? facilities : undefined,
      photos: form.value.photos.length ? form.value.photos : undefined,
    });
    uni.hideLoading();
    uni.showToast({ title: '已提交', icon: 'success' });
    uni.$emit('profile:spots:changed', { id: resp.id, status: resp.status });
    setTimeout(() => {
      uni.redirectTo({ url: `/subpackages/spot/detail/index?id=${resp.id}` }).catch(() => {
        uni.navigateBack({ delta: 1 }).catch(() => {});
      });
    }, 600);
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e?.msg || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
