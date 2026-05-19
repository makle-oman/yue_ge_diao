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
            <text class="loc-title">现场定位已通过</text>
          </view>
          <view class="loc-row">
            <view class="loc-acc">
              <mxy-icon name="check_circle" :size="24" color="#2D8F87" />
              <text class="loc-acc-text">精度 {{ accuracy }}m,可上报</text>
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

        <view class="end-pad" />
      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" @click="onSubmit">
        <text class="submit-btn-text">提交钓点,等待审核</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const { safeBottom } = useSystemInfo();

const accuracy = ref(18);

const conditions = [
  { key: 'park',   label: '可停车' },
  { key: 'toilet', label: '有厕所' },
  { key: 'shade',  label: '有遮阴' },
  { key: 'slip',   label: '防滑岸' },
  { key: 'night',  label: '可夜钓' },
];

const form = ref({
  name: '燕子矶江边',
  type: '野钓点',
  water: '江河',
  fish: ['鲫鱼', '鲤鱼'],
  conditions: ['park'] as string[],
  photos: [
    'https://images.unsplash.com/photo-1763833196218-6cdc5d7ee9c0?w=300',
  ],
  desc: '缓流，早晚窗口好，水边注意防滑。',
});

const toggleCondition = (k: string) => {
  const idx = form.value.conditions.indexOf(k);
  if (idx >= 0) form.value.conditions.splice(idx, 1);
  else form.value.conditions.push(k);
};

const onRelocate = () => {
  uni.showLoading({ title: '重新定位...' });
  setTimeout(() => {
    uni.hideLoading();
    accuracy.value = Math.max(5, Math.floor(Math.random() * 25) + 5);
    uni.showToast({ title: `精度 ${accuracy.value}m`, icon: 'success' });
  }, 800);
};
const onPickType = () => uni.showActionSheet({
  itemList: ['野钓点', '黑坑', '水库', '收费塘'],
  success: (r) => { form.value.type = ['野钓点', '黑坑', '水库', '收费塘'][r.tapIndex]; },
});
const onPickWater = () => uni.showActionSheet({
  itemList: ['江河', '湖泊', '水库', '海钓'],
  success: (r) => { form.value.water = ['江河', '湖泊', '水库', '海钓'][r.tapIndex]; },
});
const onAddFish = () => uni.showToast({ title: '选择鱼种 (待开发)', icon: 'none' });
const onRemoveFish = (idx: number) => form.value.fish.splice(idx, 1);
const onAddPhoto = () => {
  uni.chooseImage({
    count: 9 - form.value.photos.length,
    success: (res) => {
      form.value.photos.push(...res.tempFilePaths);
    },
  });
};
const onDelPhoto = (idx: number) => form.value.photos.splice(idx, 1);
const onSubmit = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请填写钓点名称', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已提交,等待审核', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
