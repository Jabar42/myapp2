const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/generate', async (req, res) => {
  const { text } = req.body;
  const framesDir = path.join(__dirname, '../frames');

  if (!fs.existsSync(framesDir)){
    fs.mkdirSync(framesDir);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(`<html><body style="font-size: 30px; font-family: monospace;">${text}</body></html>`);

  for (let i = 0; i <= text.length; i++) {
    await page.evaluate((text, i) => {
      document.body.innerText = text.slice(0, i);
    }, text, i);

    await page.screenshot({ path: `${framesDir}/frame-${String(i).padStart(4, '0')}.png` });
  }

  await browser.close();

  const videoPath = path.join(__dirname, '../public/output.mp4');
  ffmpeg()
    .input(`${framesDir}/frame-%04d.png`)
    .inputOptions('-framerate 10')
    .outputOptions('-c:v libx264', '-pix_fmt yuv420p')
    .save(videoPath)
    .on('end', () => {
      fs.rmdirSync(framesDir, { recursive: true });
      res.render('progress', { videoUrl: '/output.mp4' });
    });
});

module.exports = router;
