import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();

app.get('/', async (req, res) => {
  const startTime = Date.now(); // Start time before fetch

  try {
    const response = await fetch('https://www.bookswagon.com/eshipztracking.aspx?oid=BW24110736890249&trackingno=77268645812');
    const html = await response.text();
    const endTime = Date.now(); // End time after fetch

    const $ = cheerio.load(html);

    // Select and parse the div with id "deald-tab1"
    const dealdTab = $('#deald-tab1');
    const trackingHistory = [];

    // Extract each tracking event and clean up the status
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

    // Limit to the latest 2 entries
    const latestEntries = trackingHistory.slice(0, 2);

    // Calculate response time
    const responseTime = endTime - startTime;

    res.json({
      trackingHistory: latestEntries,
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
