<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>关于我们</h4>
          <ul>
            <li><a href="#">公司介绍</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">加入我们</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>购物指南</h4>
          <ul>
            <li><a href="#">配送方式</a></li>
            <li><a href="#">支付方式</a></li>
            <li><a href="#">售后服务</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>帮助中心</h4>
          <ul>
            <li><a href="#">常见问题</a></li>
            <li><a href="#">在线客服</a></li>
            <li><a href="#">投诉建议</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>关注我们</h4>
          <div class="social-links">
            <a href="#" class="social-icon">微信</a>
            <a href="#" class="social-icon">微博</a>
            <a href="#" class="social-icon">抖音</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2024 宠物网. All rights reserved. | <a href="#">隐私政策</a> | <a href="#">服务条款</a></p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 48px 0 24px;
  margin-top: auto;
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.footer-section {
  h4 {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 8px;

      a {
        color: #bdc3c7;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s;

        &:hover {
          color: #ff6b35;
        }
      }
    }
  }
}

.social-links {
  display: flex;
  gap: 12px;

  .social-icon {
    display: inline-block;
    padding: 8px 16px;
    background: #34495e;
    color: #ecf0f1;
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      background: #ff6b35;
      color: #fff;
    }
  }
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 24px;
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
    color: #95a5a6;

    a {
      color: #95a5a6;
      text-decoration: none;
      margin: 0 8px;

      &:hover {
        color: #ff6b35;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .app-footer {
    padding: 32px 0 80px; // 留出底部导航栏空间
  }

  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
</style>
