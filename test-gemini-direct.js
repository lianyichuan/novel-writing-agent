const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 创建代理agent
const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');

async function testGeminiDirect() {
  console.log('🚀 直接测试Gemini API...');
  
  const postData = JSON.stringify({
    contents: [{
      parts: [{
        text: "Hello, please respond in English: What is AI?"
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: '/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAHkG1YYVo_tKotAdHvzMAKVznhzsxmgE0',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    agent: proxyAgent // 使用代理
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log('📡 响应状态:', res.statusCode);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('✅ Gemini API测试成功！');
            console.log('📝 响应内容:', text?.substring(0, 200) + '...');
            resolve(true);
          } else {
            console.log('❌ API响应错误:', data);
            resolve(false);
          }
        } catch (error) {
          console.error('❌ 解析响应失败:', error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  // 先测试IP
  console.log('🔍 检查当前IP...');
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync('curl --proxy http://127.0.0.1:7890 -s https://httpbin.org/ip');
    const ipData = JSON.parse(stdout);
    console.log('🌍 当前IP:', ipData.origin);
    
    const { stdout: geoResult } = await execAsync(`curl -s http://ip-api.com/json/${ipData.origin}`);
    const geoData = JSON.parse(geoResult);
    console.log('🗺️ 地理位置:', geoData.country, geoData.regionName);
    
    if (geoData.country === 'United States') {
      console.log('✅ 位置正确，开始测试Gemini API\n');
      const success = await testGeminiDirect();
      
      if (success) {
        console.log('\n🎉 Gemini API测试成功！');
        console.log('💡 您的小说写作Agent现在可以使用Gemini API了');
      }
    } else {
      console.log('⚠️ 当前不在美国，请切换代理节点');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

main();
