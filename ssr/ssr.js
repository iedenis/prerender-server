const puppeteer = require('puppeteer');
module.exports = async function (url, browserWSEndpoint) {
  const browser = await puppeteer.connect({ browserWSEndpoint });
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, {
      timeout: 25000,
      waitUntil: 'networkidle2'
    });

    // Inject <base> on page to relative resources load properly.
    await page.evaluate(url => {
      const base = document.createElement('base');
      base.href = url;
      // Add to top of head, before all other resources.
      document.head.prepend(base);
    }, url);

    // Remove scripts and html imports. They've already executed.
    await page.evaluate(() => {
      const elements = document.querySelectorAll('script, link[rel="import"]');
      elements.forEach(e => e.remove());
    });

    const html = await page.content();

    // Close the page we opened here (not the browser).
    await page.close();

    return { html, status: response.status() };
  } catch (e) {
    const html = e.toString();
    console.warn({ message: `URL: ${url} Failed with message: ${html}` });
    return { html, status: 500 };
  }
};
