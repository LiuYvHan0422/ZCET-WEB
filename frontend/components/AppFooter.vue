<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">{{ seo.siteTitle }}</div>
          <p>专业品质，值得信赖。我们致力于为客户提供最优质的产品和服务。</p>
        </div>
        
        <div>
          <h4>快速链接</h4>
          <ul>
            <li><NuxtLink to="/">首页</NuxtLink></li>
            <li><NuxtLink to="/#products">商品展示</NuxtLink></li>
            <li><NuxtLink to="/news">新闻动态</NuxtLink></li>
            <li><NuxtLink to="/about">关于我们</NuxtLink></li>
            <li><NuxtLink to="/certificates">荣誉资质</NuxtLink></li>
          </ul>
        </div>
        
        <div>
          <h4>商品分类</h4>
          <ul>
            <li><a href="#">热门推荐</a></li>
            <li><a href="#">新品上市</a></li>
            <li><a href="#">限时优惠</a></li>
            <li><a href="#">全部商品</a></li>
          </ul>
        </div>
        
        <div>
          <h4>帮助支持</h4>
          <ul>
            <li><a href="#">常见问题</a></li>
            <li><a href="#">配送说明</a></li>
            <li><a href="#">退换政策</a></li>
            <li><a href="#">隐私条款</a></li>
          </ul>
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

// 页面加载时获取 SEO 配置
onMounted(fetchSeo)
</script>

<style scoped>
.footer {
  background: #1a1a2e;
  color: var(--white);
  padding: 60px 0 30px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-brand .logo {
  color: var(--white);
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.footer-brand p {
  color: rgba(255,255,255,0.7);
  margin-top: 15px;
  font-size: 14px;
  line-height: 1.8;
}

.footer h4 {
  margin-bottom: 20px;
  font-size: 16px;
}

.footer ul li {
  margin-bottom: 10px;
}

.footer ul a {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  transition: color 0.3s;
}

.footer ul a:hover {
  color: var(--white);
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 30px;
  text-align: center;
  color: rgba(255,255,255,0.5);
  font-size: 14px;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 20px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
