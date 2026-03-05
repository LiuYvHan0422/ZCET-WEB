<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">{{ seo.siteTitle }}</div>
          <p class="footer-desc">聚焦变压器真空辐射干燥技术，坚持诚信经营，推动行业向高效、节能、低碳方向升级。</p>
          <div class="footer-tags">
            <span>高效干燥</span>
            <span>节能降耗</span>
            <span>低碳升级</span>
            <span>诚信经营</span>
          </div>
        </div>

        <div class="footer-nav">
          <h4>站点导航</h4>
          <ul>
            <li><NuxtLink to="/">首页</NuxtLink></li>
            <li><NuxtLink to="/#products">产品中心</NuxtLink></li>
            <li><NuxtLink to="/news">新闻动态</NuxtLink></li>
            <li><NuxtLink to="/about">关于我们</NuxtLink></li>
            <li><NuxtLink to="/certificates">荣誉资质</NuxtLink></li>
            <li><NuxtLink to="/#contact">联系我们</NuxtLink></li>
          </ul>
        </div>

        <div class="footer-cta">
          <h4>业务咨询</h4>
          <p>如需方案评估、设备咨询或合作支持，可通过下方入口快速联系。</p>
          <div class="footer-actions">
            <NuxtLink class="footer-btn footer-btn-primary" to="/#contact">联系我们</NuxtLink>
            <NuxtLink class="footer-btn" to="/about">了解我们</NuxtLink>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} {{ seo.siteTitle }} 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useSeo } from '~/composables/useSeo'

const { fetchSeo, seo } = useSeo()
const currentYear = new Date().getFullYear()

onMounted(fetchSeo)
</script>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(900px 420px at 14% -20%, rgba(64, 158, 255, 0.2), transparent 60%),
    radial-gradient(700px 320px at 95% 0%, rgba(87, 109, 255, 0.18), transparent 60%),
    linear-gradient(180deg, #171b34 0%, #12162d 100%);
  color: var(--white);
  padding: 52px 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 36px;
  margin-bottom: 28px;
  align-items: start;
}

.footer-brand .logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.footer-desc {
  color: rgba(255, 255, 255, 0.76);
  margin-top: 14px;
  font-size: 14px;
  line-height: 1.8;
  max-width: 560px;
}

.footer-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-tags span {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
}

.footer h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.footer-nav ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: 10px;
  column-gap: 16px;
}

.footer-nav li {
  margin: 0;
}

.footer ul a {
  color: rgba(255, 255, 255, 0.74);
  font-size: 14px;
  transition: color 0.25s ease, opacity 0.25s ease;
}

.footer ul a:hover {
  color: #ffffff;
  opacity: 1;
}

.footer-cta {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 18px 16px;
}

.footer-cta p {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.7;
}

.footer-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  transition: all 0.25s ease;
}

.footer-btn:hover {
  border-color: rgba(255, 255, 255, 0.52);
  color: #fff;
}

.footer-btn-primary {
  border-color: rgba(80, 166, 255, 0.95);
  background: linear-gradient(135deg, #3b9bff 0%, #5f7bff 100%);
  color: #fff;
}

.footer-btn-primary:hover {
  border-color: #5ea6ff;
  filter: brightness(1.05);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 18px;
  text-align: center;
  color: rgba(255, 255, 255, 0.56);
  font-size: 14px;
}

@media (max-width: 1200px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 26px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 38px 0 18px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 22px;
  }

  .footer-brand {
    grid-column: auto;
  }

  .footer-nav ul {
    grid-template-columns: 1fr;
  }
}
</style>
