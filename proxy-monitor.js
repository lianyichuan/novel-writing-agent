#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ProxyMonitor {
  constructor() {
    this.proxyUrl = 'http://127.0.0.1:7890';
    this.checkInterval = 30000; // 30秒检查一次
    this.isMonitoring = false;
    this.lastStatus = null;
  }

  async checkProxyStatus() {
    try {
      console.log('🔍 检查代理状态...');
      
      // 检查代理是否可达
      const { stdout: ipResult } = await execAsync(`curl --proxy ${this.proxyUrl} -s --connect-timeout 5 https://httpbin.org/ip`);
      const ipData = JSON.parse(ipResult);
      
      // 检查地理位置
      const { stdout: geoResult } = await execAsync(`curl -s --connect-timeout 5 http://ip-api.com/json/${ipData.origin}`);
      const geoData = JSON.parse(geoResult);
      
      const status = {
        timestamp: new Date().toISOString(),
        isConnected: true,
        currentIP: ipData.origin,
        country: geoData.country,
        region: geoData.regionName,
        city: geoData.city,
        isUSLocation: geoData.country === 'United States',
        isp: geoData.isp
      };

      this.reportStatus(status);
      this.lastStatus = status;
      return status;

    } catch (error) {
      const status = {
        timestamp: new Date().toISOString(),
        isConnected: false,
        error: error.message,
        isUSLocation: false
      };

      this.reportStatus(status);
      this.lastStatus = status;
      return status;
    }
  }

  reportStatus(status) {
    const timestamp = new Date().toLocaleTimeString();
    
    if (status.isConnected) {
      const locationIcon = status.isUSLocation ? '🇺🇸' : '🌍';
      const statusIcon = status.isUSLocation ? '✅' : '⚠️';
      
      console.log(`${statusIcon} [${timestamp}] 代理状态: 已连接`);
      console.log(`   ${locationIcon} 位置: ${status.country} ${status.region} ${status.city}`);
      console.log(`   🌐 IP: ${status.currentIP}`);
      console.log(`   🏢 ISP: ${status.isp}`);
      
      if (!status.isUSLocation) {
        console.log(`   💡 建议: 切换到美国节点以使用Gemini API`);
      }
    } else {
      console.log(`❌ [${timestamp}] 代理状态: 连接失败`);
      console.log(`   🔧 错误: ${status.error}`);
      console.log(`   💡 建议: 检查Clash是否运行，端口7890是否开放`);
    }
    
    console.log('─'.repeat(60));
  }

  async testGeminiAPI() {
    if (!this.lastStatus || !this.lastStatus.isUSLocation) {
      console.log('⚠️ 跳过Gemini API测试：未连接到美国节点');
      return false;
    }

    try {
      console.log('🤖 测试Gemini API连接...');
      
      const response = await execAsync(`curl --proxy ${this.proxyUrl} -s -X POST \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAHkG1YYVo_tKotAdHvzMAKVznhzsxmgE0" \
        -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'`);
      
      const result = JSON.parse(response.stdout);
      
      if (result.candidates && result.candidates.length > 0) {
        console.log('✅ Gemini API测试成功');
        return true;
      } else {
        console.log('❌ Gemini API测试失败：无有效响应');
        return false;
      }
    } catch (error) {
      console.log('❌ Gemini API测试失败:', error.message);
      return false;
    }
  }

  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ 监控已在运行中');
      return;
    }

    console.log('🚀 开始代理状态监控...');
    console.log(`⏱️ 检查间隔: ${this.checkInterval / 1000}秒`);
    console.log('📝 按 Ctrl+C 停止监控\n');

    this.isMonitoring = true;

    // 立即执行一次检查
    this.checkProxyStatus();

    // 设置定时检查
    this.monitorInterval = setInterval(async () => {
      await this.checkProxyStatus();
      
      // 如果连接到美国节点，测试Gemini API
      if (this.lastStatus && this.lastStatus.isUSLocation) {
        await this.testGeminiAPI();
      }
    }, this.checkInterval);

    // 处理退出信号
    process.on('SIGINT', () => {
      this.stopMonitoring();
      process.exit(0);
    });
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    console.log('\n🛑 代理监控已停止');
  }

  async runOnceCheck() {
    console.log('🔍 执行单次代理状态检查...\n');
    const status = await this.checkProxyStatus();
    
    if (status.isUSLocation) {
      await this.testGeminiAPI();
    }
    
    return status;
  }
}

// 命令行接口
async function main() {
  const monitor = new ProxyMonitor();
  const args = process.argv.slice(2);

  if (args.includes('--monitor') || args.includes('-m')) {
    monitor.startMonitoring();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
代理监控工具 - 监控Clash代理状态和Gemini API连接

用法:
  node proxy-monitor.js           # 执行单次检查
  node proxy-monitor.js -m        # 持续监控模式
  node proxy-monitor.js --help    # 显示帮助

功能:
  ✅ 检查代理连接状态
  🌍 显示当前IP地理位置
  🇺🇸 验证是否为美国节点
  🤖 测试Gemini API连接
  ⏱️ 持续监控模式
`);
  } else {
    await monitor.runOnceCheck();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProxyMonitor;
