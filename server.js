const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/generate', async (req, res) => {
  const text = req.query.text || '안녕😀';

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // ✅ GitHub Pages 주소로 접속
  await page.goto('https://justinlee05.github.io/Slack-GIF-Maker/', {
    waitUntil: 'networkidle0',
  });

  await page.waitForSelector('#textInput');
  await page.waitForSelector('#submit');

  page.on('console', (msg) => console.log('[브라우저]', msg.text()));

  const gifDataUrl = await page.evaluate(async (text) => {
    const input = document.querySelector('#textInput')
    input.value = text;
    const button = document.querySelector('#submit')
    button.click();
    console.log(input.value, button);
    
    try{
        await new Promise((resolve,reject) => {
            // 30초 대기 후에 resolve() 호출
            setTimeout(() => {
                reject(new Error('GIF 생성 시간 초과'));
            }, 30000);
            
            const observer = new MutationObserver(() => {
                if (document.querySelector('#downloadLink')) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } catch(error){
        console.error('GIF 생성 실패:', error.message);
        return null;
    }



    return document.querySelector('#downloadLink').href;
  }, text);

  await browser.close();

  if (!gifDataUrl) {
    return res.status(500).send('❌ GIF 생성 실패');
  }

  const buffer = Buffer.from(gifDataUrl.split(',')[1], 'base64');
  res.setHeader('Content-Type', 'image/gif');
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
