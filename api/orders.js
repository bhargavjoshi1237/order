import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();

app.get('/orders', async (req, res) => {
  const startTime = Date.now();

  try {
    const response = await fetch('https://www.bookswagon.com/eshipztracking.aspx?oid=BW24110736890249&trackingno=77268645812');
    const html = await response.text();
    const endTime = Date.now();

    const $ = cheerio.load(html);
    const dealdTab = $('#deald-tab1');
    const trackingHistory = [];

    dealdTab.find('.trackinggrid').each((i, el) => {
      const date = $(el).find('.head span').text().trim();
      const events = [];

      $(el).find('.trackstep li').each((j, li) => {
        const time = $(li).find('.lefttime').text().trim();
        const status = $(li).find('.rightlocationstatus').text().replace(/\s+/g, ' ').trim();
        events.push({ time, status });
      });

      trackingHistory.push({ date, events });
    });

    const latestEntries = trackingHistory.slice(0, 2);
    const responseTime = endTime - startTime;

    res.json({
      trackingHistory: latestEntries,
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order data' });
  }
});

// Export the Express app as a serverless function
export default app;
