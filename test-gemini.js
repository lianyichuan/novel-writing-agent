const { GoogleGenerativeAI } = require('@google/generative-ai');

// 设置代理环境变量
process.env.HTTP_PROXY = 'http://127.0.0.1:7890';
process.env.HTTPS_PROXY = 'http://127.0.0.1:7890';

async function testGemini() {
  try {
    console.log('🚀 开始测试Gemini API...');
    console.log('🌐 代理设置:', process.env.HTTPS_PROXY);
    
    const genAI = new GoogleGenerativeAI('AIzaSyAHkG1YYVo_tKotAdHvzMAKVznhzsxmgE0');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    console.log('📡 发送测试请求...');
    const result = await model.generateContent('请用中文回答：AI是什么？');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ 测试成功！');
    console.log('📝 响应内容:', text);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('User location is not supported')) {
      console.log('\n🔧 解决方案：');
      console.log('1. 确保代理服务器正在运行 (端口7890)');
      console.log('2. 代理服务器需要支持访问Google服务');
      console.log('3. 尝试切换到美国或其他支持的地区节点');
      console.log('4. 检查代理配置是否正确');
    }
  }
}

testGemini();
