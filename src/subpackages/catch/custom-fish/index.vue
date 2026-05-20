<template>
  <view class="custom-fish-page">
    <!-- 顶部导航 -->
    <view class="cf-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="cf-nav">
        <view class="cf-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="cf-title">添加自定义鱼种</text>
        <text class="cf-save" @click="onSave">保存</text>
      </view>
    </view>

    <scroll-view class="cf-scroll" scroll-y>
      <!-- 预览卡 -->
      <view class="cf-preview">
        <view class="cf-preview-icon">
          <text class="cf-preview-icon-text">{{ form.name.charAt(0) || '鱼' }}</text>
        </view>
        <view class="cf-preview-info">
          <text class="cf-preview-title">{{ form.name || '创建本地鱼种卡片' }}</text>
          <text class="cf-preview-sub">用于发布鱼获、鱼库统计和历史记录筛选</text>
          <view class="cf-preview-badges">
            <view class="cf-badge cf-badge--primary"><text>未点亮</text></view>
            <view class="cf-badge cf-badge--accent"><text>自定义</text></view>
          </view>
        </view>
      </view>

      <!-- 表单 -->
      <view class="cf-form">
        <!-- 鱼种名称 -->
        <view class="cf-row cf-row--input">
          <text class="cf-row-label">鱼种名称</text>
          <input
            class="cf-row-input"
            v-model="form.name"
            placeholder="输入名称"
            placeholder-class="placeholder"
            maxlength="12"
          />
        </view>
        <view class="cf-row-divider" />

        <!-- 分类 -->
        <view class="cf-row" @click="onPickCategory">
          <text class="cf-row-label">分类</text>
          <view class="cf-row-right">
            <text class="cf-row-value accent">{{ form.category }}</text>
            <mxy-icon name="chevron_right" :size="36" color="#6B7B85" />
          </view>
        </view>
        <view class="cf-row-divider" />

        <!-- 常见水域 -->
        <view class="cf-row" @click="onPickWaters">
          <text class="cf-row-label">常见水域</text>
          <view class="cf-row-right">
            <text class="cf-row-value">{{ form.waters }}</text>
            <mxy-icon name="chevron_right" :size="36" color="#6B7B85" />
          </view>
        </view>
        <view class="cf-row-divider" />

        <!-- 备注说明 -->
        <view class="cf-row-area">
          <text class="cf-row-area-label">备注说明</text>
          <textarea
            class="cf-textarea"
            v-model="form.note"
            placeholder="可记录别名、常用钓法、识别特征等"
            placeholder-class="cf-textarea-ph"
            maxlength="200"
          />
        </view>
      </view>

      <!-- 提示横幅 -->
      <view class="cf-helper">
        <mxy-icon name="info" :size="44" color="#5BA9C4" />
        <text class="cf-helper-text">自定义鱼种仅在你的鱼库和发布记录中展示，后续可合并到官方鱼种。</text>
      </view>

    </scroll-view>

    <!-- 底部 CTA -->
    <view class="cf-bottom" :style="{ paddingBottom: (safeBottom + 22) + 'px' }">
      <view class="cf-submit" @click="onSubmit">
        <text class="cf-submit-text">保存并选择该鱼种</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const { statusBarHeight, safeBottom } = useSystemInfo();

const form = ref({
  name: '',
  category: '淡水鱼',
  waters: '江河 / 水库',
  note: '',
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onSave = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入鱼种名称', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已保存', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 500);
};

const onPickCategory = () => {
  uni.showActionSheet({
    itemList: ['淡水鱼', '海水鱼', '其他'],
    success: (res) => {
      form.value.category = ['淡水鱼', '海水鱼', '其他'][res.tapIndex];
    },
  });
};
const onPickWaters = () => {
  uni.showActionSheet({
    itemList: ['江河 / 水库', '湖泊 / 水库', '近海 / 礁石', '池塘'],
    success: (res) => {
      form.value.waters = ['江河 / 水库', '湖泊 / 水库', '近海 / 礁石', '池塘'][res.tapIndex];
    },
  });
};

const onSubmit = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入鱼种名称', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已添加 ' + form.value.name, icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
