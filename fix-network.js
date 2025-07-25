#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs-extra');
const path = require('path');

const execAsync = promisify(exec);

class NetworkFixer {
  constructor() {
    this.proxyUrl = 'http://127.0.0.1:7890';
    this.fixes = [];
  }

  async diagnose() {
    console.log('🔍 开始网络诊断...\n');
    
    const issues = [];
    
    // 1. 检查代理连接
    console.log('1️⃣ 检查代理连接...');
    try {
      await execAsync(`curl --proxy ${this.proxyUrl} -s --connect-timeout 5 https://httpbin.org/ip`);
      console.log('   ✅ 代理连接正常');
    } catch (error) {
      console.log('   ❌ 代理连接失败');
      issues.push({
        type: 'proxy_connection',
        message: '代理服务器无法连接',
        fix: 'checkClashService'
      });
    }

    // 2. 检查地理位置
    console.log('2️⃣ 检查地理位置...');
    try {
      const { stdout: ipResult } = await execAsync(`curl --proxy ${this.proxyUrl} -s --connect-timeout 5 https://httpbin.org/ip`);
      const ipData = JSON.parse(ipResult);
      
      const { stdout: geoResult } = await execAsync(`curl -s --connect-timeout 5 http://ip-api.com/json/${ipData.origin}`);
      const geoData = JSON.parse(geoResult);
      
      if (geoData.country === 'United States') {
        console.log(`   ✅ 位置正确: ${geoData.country} (${ipData.origin})`);
      } else {
        console.log(`   ⚠️ 位置不正确: ${geoData.country} (${ipData.origin})`);
        issues.push({
          type: 'wrong_location',
          message: `当前位置: ${geoData.country}，需要美国节点`,
          fix: 'switchToUSNode'
        });
      }
    } catch (error) {
      console.log('   ❌ 无法检查地理位置');
      issues.push({
        type: 'location_check_failed',
        message: '无法检查地理位置',
        fix: 'checkProxySettings'
      });
    }

    // 3. 检查后端服务
    console.log('3️⃣ 检查后端服务...');
    try {
      await execAsync('curl -s http://localhost:3001/api/health');
      console.log('   ✅ 后端服务运行正常');
    } catch (error) {
      console.log('   ❌ 后端服务无法连接');
      issues.push({
        type: 'backend_service',
        message: '后端服务未运行或端口3001被占用',
        fix: 'startBackendService'
      });
    }

    // 4. 检查Gemini API
    console.log('4️⃣ 检查Gemini API...');
    try {
      const testResult = await this.testGeminiAPI();
      if (testResult.success) {
        console.log('   ✅ Gemini API连接正常');
      } else {
        console.log(`   ❌ Gemini API连接失败: ${testResult.error}`);
        issues.push({
          type: 'gemini_api',
          message: testResult.error,
          fix: 'fixGeminiAPI'
        });
      }
    } catch (error) {
      console.log(`   ❌ Gemini API测试失败: ${error.message}`);
      issues.push({
        type: 'gemini_api',
        message: error.message,
        fix: 'fixGeminiAPI'
      });
    }

    return issues;
  }

  async testGeminiAPI() {
    try {
      const response = await execAsync(`curl --proxy ${this.proxyUrl} -s -X POST \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAHkG1YYVo_tKotAdHvzMAKVznhzsxmgE0" \
        -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'`);
      
      const result = JSON.parse(response.stdout);
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      
      if (result.candidates && result.candidates.length > 0) {
        return { success: true };
      }
      
      return { success: false, error: '无有效响应' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async applyFixes(issues) {
    console.log('\n🔧 开始应用修复方案...\n');

    for (const issue of issues) {
      console.log(`🛠️ 修复: ${issue.message}`);
      
      try {
        await this[issue.fix]();
        console.log('   ✅ 修复完成\n');
      } catch (error) {
        console.log(`   ❌ 修复失败: ${error.message}\n`);
      }
    }
  }

  async checkClashService() {
    console.log('   📋 检查Clash服务状态...');
    
    // 检查端口7890是否开放
    try {
      await execAsync('netstat -an | findstr :7890');
      console.log('   ✅ 端口7890已开放');
    } catch (error) {
      console.log('   ❌ 端口7890未开放');
      console.log('   💡 请启动Clash并确保代理端口设置为7890');
      throw new Error('Clash服务未运行');
    }
  }

  async switchToUSNode() {
    console.log('   🇺🇸 建议切换到美国节点...');
    console.log('   💡 请在Clash中手动选择美国节点 (如: 🚀美国-R1-GPT)');
    console.log('   ⏱️ 等待30秒让代理生效...');
    
    // 等待30秒
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // 重新检查位置
    try {
      const { stdout: ipResult } = await execAsync(`curl --proxy ${this.proxyUrl} -s --connect-timeout 5 https://httpbin.org/ip`);
      const ipData = JSON.parse(ipResult);
      
      const { stdout: geoResult } = await execAsync(`curl -s --connect-timeout 5 http://ip-api.com/json/${ipData.origin}`);
      const geoData = JSON.parse(geoResult);
      
      if (geoData.country === 'United States') {
        console.log('   ✅ 已成功切换到美国节点');
      } else {
        throw new Error(`仍然不是美国节点: ${geoData.country}`);
      }
    } catch (error) {
      throw new Error('无法验证节点切换结果');
    }
  }

  async checkProxySettings() {
    console.log('   ⚙️ 检查代理设置...');
    
    // 检查环境变量
    const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY'];
    for (const varName of proxyVars) {
      const value = process.env[varName];
      if (value) {
        console.log(`   📝 ${varName}: ${value}`);
      } else {
        console.log(`   ⚠️ ${varName}: 未设置`);
      }
    }
    
    // 设置代理环境变量
    process.env.HTTP_PROXY = this.proxyUrl;
    process.env.HTTPS_PROXY = this.proxyUrl;
    process.env.ALL_PROXY = this.proxyUrl;
    
    console.log('   ✅ 已设置代理环境变量');
  }

  async startBackendService() {
    console.log('   🚀 启动后端服务...');
    
    const backendPath = path.join(__dirname, 'backend');
    
    if (!await fs.pathExists(backendPath)) {
      throw new Error('后端目录不存在');
    }
    
    console.log('   📦 安装依赖...');
    await execAsync('npm install', { cwd: backendPath });
    
    console.log('   🔨 编译TypeScript...');
    await execAsync('npm run build', { cwd: backendPath });
    
    console.log('   🎯 启动服务...');
    // 使用后台启动，不等待完成
    exec('npm start', { cwd: backendPath });
    
    // 等待服务启动
    console.log('   ⏱️ 等待服务启动...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 验证服务是否启动
    try {
      await execAsync('curl -s http://localhost:3001/api/health');
      console.log('   ✅ 后端服务启动成功');
    } catch (error) {
      throw new Error('后端服务启动失败');
    }
  }

  async fixGeminiAPI() {
    console.log('   🤖 修复Gemini API连接...');
    
    // 重新测试API
    const result = await this.testGeminiAPI();
    if (result.success) {
      console.log('   ✅ Gemini API现在可以正常工作');
    } else {
      console.log(`   ⚠️ Gemini API仍有问题: ${result.error}`);
      console.log('   💡 建议: 检查API密钥是否有效，确保使用美国节点');
    }
  }

  async generateReport(issues) {
    const report = {
      timestamp: new Date().toISOString(),
      issues: issues,
      fixes: this.fixes,
      recommendations: []
    };

    if (issues.some(i => i.type === 'wrong_location')) {
      report.recommendations.push('切换到美国代理节点');
    }
    
    if (issues.some(i => i.type === 'proxy_connection')) {
      report.recommendations.push('检查Clash是否正常运行');
    }
    
    if (issues.some(i => i.type === 'backend_service')) {
      report.recommendations.push('重启后端服务');
    }

    const reportPath = path.join(__dirname, 'logs', 'network-diagnosis.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(`📊 诊断报告已保存到: ${reportPath}`);
    return report;
  }
}

async function main() {
  const fixer = new NetworkFixer();
  const args = process.argv.slice(2);

  console.log('🩺 网络连接修复工具\n');

  try {
    const issues = await fixer.diagnose();
    
    if (issues.length === 0) {
      console.log('\n🎉 所有检查都通过了！网络连接正常。');
      return;
    }

    console.log(`\n⚠️ 发现 ${issues.length} 个问题:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.message}`);
    });

    if (args.includes('--fix') || args.includes('-f')) {
      await fixer.applyFixes(issues);
    } else {
      console.log('\n💡 运行 `node fix-network.js --fix` 来自动修复这些问题');
    }

    await fixer.generateReport(issues);

  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NetworkFixer;
