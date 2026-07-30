<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  items: string[]
}>()
</script>

<template>
  <section class="placeholder-card">
    <div class="placeholder-copy">
      <span>{{ eyebrow }}</span>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>

    <div class="feature-list">
      <div
        v-for="(item, index) in items"
        :key="item"
        class="feature-item"
      >
        <strong>{{ String(index + 1).padStart(2, '0') }}</strong>
        <span>{{ item }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.placeholder-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.8fr);
  gap: 48px;

  min-height: 440px;
  padding: 48px;

  background:
    radial-gradient(circle at 90% 10%, rgba(99, 91, 255, 0.12), transparent 35%),
    #ffffff;

  border: 1px solid var(--border);
  border-radius: var(--radius-large);
  box-shadow: 0 16px 45px rgba(16, 24, 40, 0.06);
}

.placeholder-copy {
  align-self: center;
}

.placeholder-copy > span {
  display: inline-block;
  margin-bottom: 18px;
  padding: 7px 12px;

  color: var(--primary-color);
  font-size: 12px;
  font-weight: 800;

  background: var(--primary-light);
  border-radius: 999px;
}

.placeholder-copy h2 {
  max-width: 600px;
  margin-bottom: 16px;
  font-size: clamp(30px, 5vw, 52px);
  line-height: 1.12;
}

.placeholder-copy p {
  max-width: 590px;
  margin-bottom: 0;

  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.8;
}

.feature-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;

  padding: 17px;

  color: var(--text-secondary);
  background: rgba(247, 248, 252, 0.88);
  border: 1px solid var(--border);
  border-radius: 13px;
}

.feature-item strong {
  color: var(--primary-color);
  font-size: 12px;
}

.feature-item span {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .placeholder-card {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px;
  }
}

@media (max-width: 480px) {
  .placeholder-card {
    padding: 23px;
  }
}
</style>