import { Page } from 'puppeteer';
import IBlog from '../models/Iblog';
import Article from '../models/Article';
import articleQueue from '../models/articleQueue';
import axios from 'axios';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin
puppeteer.use(StealthPlugin());

export default async function scrapeBlog(
    config: IBlog,
    existingPage: Page | null = null,
    limit: number | null = null
) {
    const proxy = await getProxy();
    console.log("Using proxy:", proxy);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Ensure headless is true for testing
            //args: [`--proxy-server=${proxy}`]
        });
        let page = await browser.newPage();
        await page.goto(`${config.blogUrl}${config.indexPage}`, {
            waitUntil: "networkidle2",
            timeout: 30000 // Increase timeout
        });

        // Wait for the article links to load
        await page.waitForSelector(config.articleLinkSelector, { timeout: 15000 });

        let blogLinks = await page.$$eval(config.articleLinkSelector, (elements) => {
            return elements.map((element) => (element as HTMLAnchorElement).href);
        });

        console.log(blogLinks);

        // Cut array
        if (limit) blogLinks = blogLinks.slice(0, limit);
        const existingArticleLinks = await Article.find(
            { dataSourceId: config._id },
            'articleUrl'
        );
        const existingArticleLinksSet = new Set(
            existingArticleLinks.map((a) => a.articleUrl)
        );
        const newLinks = blogLinks.filter(
            (url: string) => !existingArticleLinksSet.has(url)
        );
        for (const url of newLinks) {
            console.log("Adding article to queue", url);
            //await articleQueue.add(url, { url, config });
            await retryScrapeDetails(url, config);
        }
        return blogLinks;
    } catch (error) {
        console.error("Error during scraping blog:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function retryScrapeDetails(url: string, config: IBlog, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await scrapeDetails(url, config);
            break; // Exit loop if successful
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${url}:`, error);
            if (attempt === retries) {
                console.error(`Failed to scrape details for ${url} after ${retries} attempts.`);
            }
        }
    }
}

async function scrapeDetails(url: string, config: IBlog) {
    const proxy = await getProxy();
    console.log("Using proxy:", proxy);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            //args: [`--proxy-server=${proxy}`]
        });
        let page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Wait for the details to load
        await page.waitForSelector(config.detailsSelector, { timeout: 15000 });

        //获取页面内容 section,去除html标签
        const content = await page.$$eval(config.detailsSelector, (elements) => {
            return elements.map((element) => (element as HTMLElement).innerText);
        });
        const text = content.join('\n');
        //console.log(text);
        //存储到数据库
        await Article.create({
            articleUrl: url,
            dataSourceId: config._id,
            content: text
        });

        //find db article count
        const articleCount = await Article.countDocuments({ dataSourceId: config._id });
        console.log("Added to the database! current count:", articleCount);    
    } catch (error) {
        console.error("Error during scraping details:", error);
        throw error; // Re-throw error to handle retries
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function getProxy() {
    const proxies = await import('fs/promises');
    const proxyList = (await proxies.readFile('./proxies.txt', 'utf8')).split('\n');
    const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    return randomProxy;
}