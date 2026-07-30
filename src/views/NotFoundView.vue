<template>
  <main class="not-found">
    <span>404</span>
    <h1>页面不存在</h1>
    <p>你访问的页面可能已被移动或删除。</p>

    <RouterLink to="/dashboard">
      返回数据总览
    </RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
  align-content: center;

  min-height: 100vh;
  padding: 30px;
  text-align: center;
}

.not-found span {
  color: var(--primary-color);
  font-size: 70px;
  font-weight: 900;
}

.not-found h1 {
  margin-bottom: 10px;
}

.not-found p {
  color: var(--text-secondary);
}

.not-found a {
  margin-top: 15px;
  padding: 12px 18px;

  color: #ffffff;
  font-weight: 700;

  background: var(--primary-color);
  border-radius: 10px;
}
</style>