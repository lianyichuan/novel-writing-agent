const { GoogleGenerativeAI } = require('@google/generative-ai');
const { HttpsProxyAgent } = require('https-proxy-agent');
const https = require('https');

// 配置代理
const proxyUrl = 'http://127.0.0.1:7890';
const proxyAgent = new HttpsProxyAgent(proxyUrl);

// 设置全局代理
process.env.HTTPS_PROXY = proxyUrl;
process.env.HTTP_PROXY = proxyUrl;
process.env.ALL_PROXY = proxyUrl;

// 设置Node.js全局代理
https.globalAgent = proxyAgent;

async function testProxyConnection() {
  console.log('🔍 测试代理连接...');

  try {
    // 使用curl测试，因为它能正确使用代理
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // 测试1: 检查IP地址
    console.log('📍 检查当前IP地址...');
    const { stdout: ipResult } = await execAsync('curl --proxy http://127.0.0.1:7890 -s https://httpbin.org/ip');
    const ipData = JSON.parse(ipResult);
    console.log('🌍 当前IP:', ipData.origin);

    // 测试2: 检查地理位置
    console.log('📍 检查地理位置...');
    const { stdout: geoResult } = await execAsync(`curl -s http://ip-api.com/json/${ipData.origin}`);
    const geoData = JSON.parse(geoResult);
    console.log('🗺️ 地理位置:', geoData.country, geoData.regionName, geoData.city);

    if (geoData.country !== 'United States') {
      console.log('⚠️ 警告: 当前不在美国，可能无法使用Gemini API');
      console.log('💡 建议: 在Clash中切换到美国节点 (🚀美国-R1-GPT 等)');
      return false;
    } else {
      console.log('✅ 位置正确: 美国');
      return true;
    }

  } catch (error) {
    console.error('❌ 代理连接测试失败:', error.message);
    return false;
  }
}

async function testGeminiAPI() {
  console.log('\n🤖 测试Gemini API...');
  
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyAHkG1YYVo_tKotAdHvzMAKVznhzsxmgE0');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    console.log('📡 发送测试请求...');
    const result = await model.generateContent('Hello, please respond in English: What is AI?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API测试成功！');
    console.log('📝 响应内容:', text.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API测试失败:', error.message);
    
    if (error.message.includes('User location is not supported')) {
      console.log('\n🔧 解决方案:');
      console.log('1. 在Clash中选择美国节点 (🚀美国-R1-GPT)');
      console.log('2. 等待几分钟让代理生效');
      console.log('3. 重新运行此测试');
    }
    
    return false;
  }
}

async function main() {
  console.log('🚀 开始代理和Gemini API测试\n');

  const proxyOk = await testProxyConnection();
  if (!proxyOk) {
    console.log('\n❌ 代理测试失败，请检查代理设置');
    return;
  }

  const success = await testGeminiAPI();

  if (success) {
    console.log('\n🎉 所有测试通过！可以正常使用Gemini API');
    console.log('💡 现在可以启动您的小说写作Agent了');
  } else {
    console.log('\n❌ Gemini API测试失败，请检查代理设置');
  }
}

main().catch(console.error);
