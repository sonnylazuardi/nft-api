const puppeteer = require("puppeteer-core");
const cheerio = require("cheerio");
const chrome = require("chrome-aws-lambda");

export default async (req, res) => {
  const slug = req?.query?.slug;
  if (!slug) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false }));
    return;
  }

  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();
  page.setUserAgent(
    "Opera/9.80 (J2ME/MIDP; Opera Mini/5.1.21214/28.2725; U; ru) Presto/2.8.119 Version/11.10"
  );
  await page.goto(`https://opensea.io/${slug}`);

  let content = await page.content();
  var $ = cheerio.load(content);
  $.prototype.exists = function (selector) {
    return this.find(selector).length > 0;
  };

  const result = $(".AccountHeader--address").text();

  let images = [];

  $(".AssetMedia--img .Image--image").each((_, elm) => {
    images.push($(elm).attr("href"));
  });

  await browser.close();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ result, images }));
};
