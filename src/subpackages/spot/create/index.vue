<template>
  <view class="spot-create">
    <mxy-form-nav :title="isEdit ? '编辑钓点' : '上报新钓点'" :action-text="isEdit ? '保存' : '提交'" @action="onSubmit" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 现场定位 -->
        <view class="loc-card">
          <view class="loc-map">
            <!-- #ifdef MP-WEIXIN || H5 -->
            <map
              class="loc-map-view"
              :latitude="mapCenter.latitude"
              :longitude="mapCenter.longitude"
              :scale="16"
              :markers="locMarkers"
              show-location
              enable-zoom
              enable-scroll
              @tap="onMapTap"
            >
              <cover-view class="loc-map-badge">
                <cover-view class="loc-title">{{ locTitle }}</cover-view>
              </cover-view>
            </map>
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <!-- #ifndef H5 -->
            <view class="loc-map-fallback">
              <view class="loc-river" />
              <text class="loc-title">{{ locTitle }}</text>
            </view>
            <!-- #endif -->
            <!-- #endif -->
            <view class="loc-map-expand" @click="openFullMap">
              <view class="loc-map-expand-icon">
                <view class="loc-map-expand-corner tl"></view>
                <view class="loc-map-expand-corner tr"></view>
                <view class="loc-map-expand-corner bl"></view>
                <view class="loc-map-expand-corner br"></view>
              </view>
            </view>
          </view>
          <view class="loc-row">
            <view class="loc-acc">
              <mxy-icon :name="locIcon" :size="24" :color="locIconColor" />
              <text class="loc-acc-text">{{ locHint }}</text>
            </view>
            <view class="loc-relocate" @click="onRelocate">
              <text>重新定位</text>
            </view>
            <view class="loc-relocate" @click="onChooseLocation">
              <text>搜索位置</text>
            </view>
          </view>
          <view class="loc-search">
            <view class="loc-search-bar">
              <mxy-icon name="search" :size="28" color="#6B7B85" />
              <input
                class="loc-search-input"
                v-model="locationKeyword"
                :focus="locationInputFocus"
                placeholder="搜索地点，如 容县绣江"
                placeholder-style="color:#99A5AD"
                confirm-type="search"
                @confirm="onSearchLocation"
                @blur="locationInputFocus = false"
              />
              <text class="loc-search-action" @click="onSearchLocation">搜索</text>
            </view>
            <view v-if="locationResults.length" class="loc-search-results">
              <view
                v-for="item in locationResults"
                :key="item.id"
                class="loc-search-result"
                @click="selectSearchLocation(item)"
              >
                <text class="loc-search-name">{{ item.name }}</text>
                <text class="loc-search-address">{{ item.address }}</text>
              </view>
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
                v-for="(f, idx) in fishOptions"
                :key="f"
                class="fish-chip"
                :class="form.fish.includes(f) ? `tone-${idx % 3}` : 'muted'"
                @click="toggleFish(f)"
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
        <text class="submit-btn-text">{{ isEdit ? '保存钓点修改' : '提交钓点,等待审核' }}</text>
      </view>
    </view>

    <view v-if="fullMapOpen" class="full-map-layer">
      <!-- #ifdef MP-WEIXIN || H5 -->
      <map
        id="spotCreateFullMap"
        class="full-map-view"
        :latitude="fullMapCenter.latitude"
        :longitude="fullMapCenter.longitude"
        :scale="18"
        show-location
        enable-zoom
        enable-scroll
        @regionchange="onFullMapRegionChange"
        @tap="onFullMapTap"
      />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <!-- #ifndef H5 -->
      <view class="full-map-view full-map-fallback" />
      <!-- #endif -->
      <!-- #endif -->
      <view class="full-map-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="full-map-close" @click="closeFullMap">
          <mxy-icon name="close" :size="36" color="#1A2B33" />
        </view>
        <text class="full-map-heading">精确位置</text>
        <view class="full-map-locate" @click="onFullMapRelocate">
          <mxy-icon name="my_location" :size="36" color="#2D8F87" />
        </view>
      </view>
      <view class="full-map-search" :style="{ top: statusBarHeight + 66 + 'px' }">
        <view class="full-map-search-bar">
          <mxy-icon name="search" :size="30" color="#6B7B85" />
          <input
            class="full-map-search-input"
            v-model="locationKeyword"
            placeholder="搜索地点后再拖动精标"
            placeholder-style="color:#99A5AD"
            confirm-type="search"
            @confirm="onSearchLocation"
          />
          <text class="full-map-search-action" @click="onSearchLocation">{{ locationSearching ? '搜索中' : '搜索' }}</text>
        </view>
        <view v-if="locationResults.length" class="full-map-search-results">
          <view
            v-for="item in locationResults"
            :key="item.id"
            class="full-map-search-result"
            @click="selectSearchLocation(item)"
          >
            <text class="full-map-search-name">{{ item.name }}</text>
            <text class="full-map-search-address">{{ item.address }}</text>
          </view>
        </view>
      </view>
      <view class="full-map-pin">
        <view class="full-map-pin-dot" />
      </view>
      <view class="full-map-bottom" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
        <view class="full-map-info">
          <text class="full-map-info-title">{{ fullMapAddress || '地图中心点' }}</text>
          <text class="full-map-info-sub">{{ fullMapCoordText }}</text>
        </view>
        <view class="full-map-confirm" @click="confirmFullMap">
          <text>确定位置</text>
        </view>
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
import { ref, computed, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import { fetchFishCatalog, type FishCategory } from '@/api/fishes';
import {
  createSpot,
  editableSpotDetail,
  SPOT_TYPE_LABEL,
  updateSpot,
  WATER_TYPE_LABEL,
  type EditableSpotDetail,
  type SpotType,
  type WaterType,
} from '@/api/spots';
import { uploadImages } from '@/utils/upload';

const { safeBottom, statusBarHeight } = useSystemInfo();

const ACCURACY_LIMIT = 50;
const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const MAP_MARKER_ICON = '/static/spot-marker.png';

type LocationStatus = 'idle' | 'locating' | 'ready' | 'low_accuracy' | 'failed';
interface GeoPoint {
  latitude: number;
  longitude: number;
}
interface UniLocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
interface UniSettingResult {
  authSetting?: {
    'scope.userLocation'?: boolean;
  };
}
interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}
interface NominatimAddress {
  amenity?: string;
  park?: string;
  tourism?: string;
  road?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  municipality?: string;
  county?: string;
  region?: string;
  state?: string;
  district?: string;
}
interface NominatimPlace {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  address?: NominatimAddress;
}
interface NominatimReverseResp {
  display_name?: string;
  name?: string;
  address?: NominatimAddress;
}
interface MapTapEvent {
  detail?: {
    latitude?: number;
    longitude?: number;
  };
}
interface MapRegionChangeEvent {
  type?: string;
  detail?: {
    centerLocation?: Partial<GeoPoint>;
  };
}
interface MapContextLike {
  getCenterLocation?: (opts: {
    success: (res: GeoPoint) => void;
    fail?: () => void;
  }) => void;
}

const accuracy = ref<number | null>(null);
const lat = ref<number>(0);
const lng = ref<number>(0);
const locationManual = ref(false);
const locationName = ref('');
const locationAddress = ref('');
const locationCity = ref('');
const locationKeyword = ref('');
const locationInputFocus = ref(false);
const locationSearching = ref(false);
const locationResults = ref<LocationSearchResult[]>([]);
const fullMapOpen = ref(false);
const fullMapCenter = ref<GeoPoint>({ ...DEFAULT_CENTER });
const fullMapAddress = ref('');
const locating = ref(false);
const locationFailed = ref(false);
const submitting = ref(false);
const editId = ref('');
const isEdit = computed(() => !!editId.value);
let fullMapAddressSeq = 0;

const hasLocation = computed(() => Number.isFinite(lat.value) && Number.isFinite(lng.value) && lat.value !== 0 && lng.value !== 0);
const locOk = computed(() => hasLocation.value && (accuracy.value == null || accuracy.value <= ACCURACY_LIMIT));
const locStatus = computed<LocationStatus>(() => {
  if (locating.value) return 'locating';
  if (!hasLocation.value) return locationFailed.value ? 'failed' : 'idle';
  if (!locOk.value) return 'low_accuracy';
  return 'ready';
});
const locIcon = computed(() => {
  if (locOk.value) return 'check_circle';
  if (locStatus.value === 'low_accuracy' || locStatus.value === 'failed') return 'warning';
  return 'my_location';
});
const locIconColor = computed(() => (locOk.value ? '#2D8F87' : '#F5A623'));
const locTitle = computed(() => {
  if (locationManual.value && hasLocation.value) return '已选择钓点位置';
  if (isEdit.value && hasLocation.value) return '原定位已加载';
  if (locStatus.value === 'locating' || locStatus.value === 'idle') return '正在获取定位…';
  if (locStatus.value === 'failed') return '定位未获取';
  if (locOk.value) return '现场定位已通过';
  return '当前精度偏低';
});
const mapCenter = computed(() => ({
  latitude: hasLocation.value ? lat.value : DEFAULT_CENTER.latitude,
  longitude: hasLocation.value ? lng.value : DEFAULT_CENTER.longitude,
}));
const locMarkers = computed(() => {
  if (!hasLocation.value) return [];
  return [{
    id: 1,
    latitude: lat.value,
    longitude: lng.value,
    iconPath: MAP_MARKER_ICON,
    width: 28,
    height: 36,
    callout: {
      content: '当前位置',
      color: '#1A2B33',
      fontSize: 12,
      borderRadius: 12,
      bgColor: '#FFFFFF',
      padding: 6,
      display: 'ALWAYS',
    },
  }];
});
const formatCoord = (value: number) => value.toFixed(6);
const fullMapCoordText = computed(() => `${formatCoord(fullMapCenter.value.latitude)}, ${formatCoord(fullMapCenter.value.longitude)}`);
const locHint = computed(() => {
  if (locStatus.value === 'locating' || locStatus.value === 'idle') return '请稍候，正在获取经纬度';
  if (!hasLocation.value) return '定位失败，请重新定位';
  if (locationName.value || locationAddress.value) return locationName.value || locationAddress.value;
  if (locationManual.value) return '已手动选择位置';
  const coordText = `经纬度 ${formatCoord(lat.value)}, ${formatCoord(lng.value)}`;
  if (accuracy.value == null) return coordText;
  if (locOk.value) return `${coordText} · 精度 ${accuracy.value}m`;
  return `精度 ${accuracy.value}m 偏低，可搜索位置修正`;
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
const TYPE_CODE_TO_LABEL: Record<SpotType, SpotTypeKey> = {
  wild: '野钓点',
  black: '黑坑',
  paid: '收费塘',
  sea: '海钓',
};
const WATER_CODE_TO_LABEL: Record<WaterType, WaterTypeKey> = {
  river: '江河',
  lake: '湖泊',
  reservoir: '水库',
  pond: '池塘',
  sea: '海域',
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
const fishOptions = ref<string[]>([]);

const toggleCondition = (k: string) => {
  const idx = form.value.conditions.indexOf(k);
  if (idx >= 0) form.value.conditions.splice(idx, 1);
  else form.value.conditions.push(k);
};

function getLocationOnce(isHighAccuracy: boolean): Promise<UniLocationResult> {
  return new Promise((resolve, reject) =>
    uni.getLocation({
      type: 'gcj02',
      isHighAccuracy,
      success: resolve,
      fail: reject,
    }),
  );
}

function nameFromAddress(address?: NominatimAddress): string {
  return address?.amenity
    || address?.park
    || address?.tourism
    || address?.road
    || address?.suburb
    || address?.city_district
    || address?.city
    || address?.county
    || address?.region
    || address?.state
    || '';
}

function normalizeCityName(name: string): string {
  return name.trim().replace(/市$/, '');
}

function cityFromAddress(address?: NominatimAddress): string {
  return normalizeCityName(
    address?.county
    || address?.city
    || address?.town
    || address?.municipality
    || address?.region
    || address?.district
    || address?.city_district
    || address?.state
    || '',
  );
}

function cityFromPlainAddress(text: string): string {
  const compact = text.trim();
  if (!compact) return '';
  return normalizeCityName(
    compact.match(/([\u4e00-\u9fa5]{1,}县)/)?.[1]
    || compact.match(/([\u4e00-\u9fa5]{1,}市)/)?.[1]
    || compact.match(/([\u4e00-\u9fa5]{1,}区)/)?.[1]
    || '',
  );
}

async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<{ name: string; address: string; city: string } | null> {
  // #ifdef H5
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&accept-language=zh-CN`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimReverseResp;
    return {
      name: data.name || nameFromAddress(data.address),
      address: data.display_name || '',
      city: cityFromAddress(data.address),
    };
  } catch (e) {
    console.warn('[spot-create] reverse geocode failed', e);
  }
  // #endif
  return null;
}

async function fillAddressForCurrentLocation(latitude: number, longitude: number) {
  const place = await reverseGeocodeLocation(latitude, longitude);
  if (!place) return;
  locationName.value = place.name || locationName.value;
  locationAddress.value = place.address || locationAddress.value;
  locationCity.value = place.city || locationCity.value || cityFromPlainAddress(place.address);
}

async function searchLocation(keyword: string): Promise<LocationSearchResult[]> {
  // #ifdef H5
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=cn&limit=8&accept-language=zh-CN&q=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const list = (await res.json()) as NominatimPlace[];
    return list
      .map((item, index) => {
        const latitude = Number(item.lat);
        const longitude = Number(item.lon);
        return {
          id: String(item.place_id ?? `${item.osm_type ?? 'place'}-${item.osm_id ?? index}`),
          name: item.name || nameFromAddress(item.address) || keyword,
          address: item.display_name || '',
          city: cityFromAddress(item.address) || cityFromPlainAddress(item.display_name || ''),
          latitude,
          longitude,
        };
      })
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  } catch (e) {
    console.warn('[spot-create] search location failed', e);
  }
  // #endif
  return [];
}

/** 真正调 uni.getLocation 拿经纬度+精度。失败给 toast 不阻塞。 */
async function fetchLocation(silent = false) {
  if (!silent) uni.showLoading({ title: '定位中...' });
  locating.value = true;
  locationFailed.value = false;
  try {
    // #ifdef MP-WEIXIN
    const setting = await new Promise<UniSettingResult>((resolve, reject) =>
      uni.getSetting({ success: resolve, fail: reject }),
    );
    if (setting?.authSetting?.['scope.userLocation'] === false) {
      if (!silent) {
        uni.hideLoading();
        uni.showModal({
          title: '需要定位权限',
          content: '获取你的位置用于上报钓点坐标',
          confirmText: '去设置',
          success: (res) => { if (res.confirm) uni.openSetting(); },
        });
      }
      locationFailed.value = true;
      return;
    }
    // #endif
    const loc = await getLocationOnce(true).catch(() => getLocationOnce(false));
    const nextLat = Number(loc.latitude);
    const nextLng = Number(loc.longitude);
    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) throw new Error('invalid location');
    lat.value = nextLat;
    lng.value = nextLng;
    locationManual.value = false;
    locationName.value = '';
    locationAddress.value = '';
    locationCity.value = '';
    locationResults.value = [];
    accuracy.value = typeof loc.accuracy === 'number' && Number.isFinite(loc.accuracy)
      ? Math.round(loc.accuracy)
      : null;
    void fillAddressForCurrentLocation(nextLat, nextLng);
    if (!silent) {
      uni.hideLoading();
      if (accuracy.value != null && accuracy.value > ACCURACY_LIMIT) {
        uni.showToast({ title: `精度 ${accuracy.value}m 偏低，请到开阔处再试`, icon: 'none' });
      } else {
        uni.showToast({ title: accuracy.value == null ? '定位成功' : `精度 ${accuracy.value}m`, icon: 'success' });
      }
    }
  } catch (_) {
    locationFailed.value = true;
    if (!silent) {
      uni.hideLoading();
      uni.showToast({ title: '定位失败，请检查权限或搜索位置', icon: 'none' });
    }
  } finally {
    locating.value = false;
  }
}

function applyManualLocation(nextLat: number, nextLng: number, name = '', address = '', city = '') {
  if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) return;
  lat.value = nextLat;
  lng.value = nextLng;
  accuracy.value = null;
  locationManual.value = true;
  locationName.value = name.trim();
  locationAddress.value = address.trim();
  locationCity.value = normalizeCityName(city) || cityFromPlainAddress(`${address} ${name}`);
  locationResults.value = [];
  locationFailed.value = false;
  if (!locationName.value && !locationAddress.value) void fillAddressForCurrentLocation(nextLat, nextLng);
}

function validGeoPoint(latitude: number, longitude: number): GeoPoint | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function setFullMapCenter(latitude: number, longitude: number) {
  const point = validGeoPoint(latitude, longitude);
  if (!point) return;
  fullMapCenter.value = point;
  fullMapAddress.value = '';
}

async function syncFullMapAddress(point = fullMapCenter.value) {
  const seq = ++fullMapAddressSeq;
  fullMapAddress.value = '正在识别位置';
  const place = await reverseGeocodeLocation(point.latitude, point.longitude);
  if (seq !== fullMapAddressSeq) return;
  fullMapAddress.value = place?.name || place?.address || '地图中心点';
}

function getFullMapCenter(): Promise<GeoPoint> {
  return new Promise((resolve) => {
    const context = uni.createMapContext('spotCreateFullMap') as MapContextLike;
    if (!context.getCenterLocation) {
      resolve(fullMapCenter.value);
      return;
    }
    context.getCenterLocation({
      success: (res) => {
        const point = validGeoPoint(Number(res.latitude), Number(res.longitude));
        resolve(point ?? fullMapCenter.value);
      },
      fail: () => resolve(fullMapCenter.value),
    });
  });
}

function applyEditableSpot(d: EditableSpotDetail) {
  const typeCode = d.type;
  const waterCode = d.waterType ?? 'river';
  form.value.name = d.name;
  form.value.typeCode = typeCode;
  form.value.type = TYPE_CODE_TO_LABEL[typeCode] ?? '野钓点';
  form.value.waterCode = waterCode;
  form.value.water = WATER_CODE_TO_LABEL[waterCode] ?? '江河';
  form.value.fish = d.fishSpecies;
  form.value.photos = d.photos;
  form.value.desc = d.description ?? '';
  form.value.conditions = Object.keys(d.facilities).filter(
    (k) => d.facilities[k] === true,
  );
  lat.value = d.lat;
  lng.value = d.lng;
  accuracy.value = null;
  locationManual.value = true;
  locationName.value = d.name;
  locationAddress.value = d.address ?? '';
  locationCity.value = d.city ?? cityFromPlainAddress(d.address ?? '');
  locationFailed.value = false;
}

async function loadFishOptions() {
  try {
    const category: FishCategory = form.value.waterCode === 'sea' || form.value.typeCode === 'sea' ? 'sea' : 'fresh';
    const { list } = await fetchFishCatalog({ category, filter: 'common' });
    const names = list.map((item) => item.name);
    fishOptions.value = Array.from(new Set([...form.value.fish, ...names])).slice(0, 18);
  } catch (e) {
    console.warn('[spot-create] fish catalog load failed', e);
    fishOptions.value = form.value.fish;
  }
}

async function loadEditSpot() {
  try {
    const d = await editableSpotDetail(editId.value);
    applyEditableSpot(d);
    void loadFishOptions();
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '钓点加载失败', icon: 'none' });
    setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
  }
}

onLoad((options) => {
  editId.value = String((options as { id?: string })?.id ?? '');
  if (editId.value) void loadEditSpot();
  else {
    void fetchLocation(true);
    void loadFishOptions();
  }
});

const onRelocate = () => fetchLocation(false);
const openFullMap = () => {
  locationInputFocus.value = false;
  locationResults.value = [];
  fullMapCenter.value = hasLocation.value
    ? { latitude: lat.value, longitude: lng.value }
    : { ...DEFAULT_CENTER };
  fullMapAddress.value = locationAddress.value || locationName.value || '';
  fullMapOpen.value = true;
  if (!fullMapAddress.value) void syncFullMapAddress();
};
const closeFullMap = () => {
  fullMapOpen.value = false;
  locationResults.value = [];
};
const onFullMapRegionChange = async (e: MapRegionChangeEvent) => {
  if (e.type && e.type !== 'end') return;
  const centerLocation = e.detail?.centerLocation;
  if (centerLocation) {
    setFullMapCenter(Number(centerLocation.latitude), Number(centerLocation.longitude));
  } else {
    const point = await getFullMapCenter();
    setFullMapCenter(point.latitude, point.longitude);
  }
  void syncFullMapAddress();
};
const onFullMapTap = (e: MapTapEvent) => {
  setFullMapCenter(Number(e.detail?.latitude), Number(e.detail?.longitude));
  void syncFullMapAddress();
};
const onFullMapRelocate = async () => {
  await fetchLocation(false);
  if (hasLocation.value) {
    setFullMapCenter(lat.value, lng.value);
    fullMapAddress.value = locationAddress.value || locationName.value || '';
    if (!fullMapAddress.value) void syncFullMapAddress();
  }
};
const confirmFullMap = async () => {
  const point = await getFullMapCenter();
  fullMapCenter.value = point;
  fullMapOpen.value = false;
  applyManualLocation(point.latitude, point.longitude);
  const place = await reverseGeocodeLocation(point.latitude, point.longitude);
  if (place) {
    locationName.value = place.name || locationName.value;
    locationAddress.value = place.address || locationAddress.value;
    locationCity.value = place.city || locationCity.value || cityFromPlainAddress(place.address);
  }
};
const onChooseLocation = async () => {
  locationInputFocus.value = false;
  await nextTick();
  locationInputFocus.value = true;
  if (locationKeyword.value.trim()) await onSearchLocation();
};
const onSearchLocation = async () => {
  const keyword = locationKeyword.value.trim();
  if (!keyword || locationSearching.value) return;
  locationSearching.value = true;
  try {
    const list = await searchLocation(keyword);
    locationResults.value = list;
    if (!list.length) uni.showToast({ title: '没有找到位置', icon: 'none' });
  } finally {
    locationSearching.value = false;
  }
};
const selectSearchLocation = (item: LocationSearchResult) => {
  locationKeyword.value = item.name;
  if (fullMapOpen.value) {
    fullMapCenter.value = { latitude: item.latitude, longitude: item.longitude };
    fullMapAddress.value = item.name || item.address;
    locationResults.value = [];
    return;
  }
  applyManualLocation(item.latitude, item.longitude, item.name, item.address, item.city);
};
const onMapTap = (e: MapTapEvent) => {
  const nextLat = Number(e.detail?.latitude);
  const nextLng = Number(e.detail?.longitude);
  if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) return;
  applyManualLocation(nextLat, nextLng);
};
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
  void loadFishOptions();
};
const onWaterDone = () => {
  form.value.water = draftWater.value;
  form.value.waterCode = WATER_LABEL_TO_CODE[draftWater.value];
  waterOpen.value = false;
  void loadFishOptions();
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
          fishOptions.value = Array.from(new Set([value, ...fishOptions.value]));
        }
      }
    },
  });
};
const toggleFish = (name: string) => {
  const idx = form.value.fish.indexOf(name);
  if (idx >= 0) form.value.fish.splice(idx, 1);
  else form.value.fish.push(name);
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

  const facilities: Record<string, boolean> = {};
  for (const k of form.value.conditions) facilities[k] = true;
  // 收费塘类型默认带 paid:true，便于搜索 hasParking/hasToilet 之外的复合查询
  if (form.value.typeCode === 'paid') facilities.paid = true;

  submitting.value = true;
  uni.showLoading({ title: '提交中...' });
  try {
    const payload = {
      name,
      type: form.value.typeCode,
      waterType: form.value.waterCode,
      lat: lat.value,
      lng: lng.value,
      accuracy: locOk.value ? accuracy.value ?? undefined : undefined,
      address: locationAddress.value || locationName.value || undefined,
      city: locationCity.value || cityFromPlainAddress(`${locationAddress.value} ${locationName.value}`) || undefined,
      description: form.value.desc.trim() || undefined,
      fishSpecies: form.value.fish.length ? form.value.fish : undefined,
      facilities: Object.keys(facilities).length ? facilities : undefined,
      photos: form.value.photos.length ? form.value.photos : undefined,
    };
    const resp = isEdit.value
      ? await updateSpot({ spotId: editId.value, ...payload })
      : await createSpot(payload);
    uni.hideLoading();
    uni.showToast({ title: isEdit.value ? '已保存' : '已提交', icon: 'success' });
    setTimeout(() => {
      if (isEdit.value) {
        uni.navigateBack({ delta: 1 }).catch(() => {});
      } else {
        uni.redirectTo({ url: `/subpackages/spot/detail/index?id=${resp.id}` }).catch(() => {
          uni.navigateBack({ delta: 1 }).catch(() => {});
        });
      }
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
