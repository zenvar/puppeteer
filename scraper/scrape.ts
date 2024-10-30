import puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import IBlog from '../models/Iblog';
import Article from '../models/Article';
import articleQueue from '../models/articleQueue';
import axios from 'axios';

export default async function scrapeBlog(
    config: IBlog,
    existingPage: Page | null = null,
    limit: number | null = null
) {
    const proxy = await getProxy();
    console.log("Using proxy:", proxy);

    let browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${proxy}`]
    });
    let page = await browser.newPage();
    await page.goto(`${config.blogUrl}${config.indexPage}`, {
        waitUntil: "networkidle2",
    });
    //等待10s
    await new Promise(resolve => setTimeout(resolve, 10000));
    let blogLinks = await page.$$eval(config.articleLinkSelector, (elements) => {
        return elements.map((element) => (element as HTMLAnchorElement).href);
    });

    console.log(blogLinks);

    if (browser) {
        await page.close();
        await browser.close();
    }
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
        await articleQueue.add(url, { url, config });
        await scrapeDetails(url, config);
    }
    return blogLinks;
}

function StealthPlugin(): any {
    throw new Error('Function not implemented.');
}

async function scrapeDetails(url: string, config: IBlog) {
    const proxy = await getProxy();
    console.log("Using proxy:", proxy);
    let browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${proxy}`]
    });
    let page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    //等待10s
    await new Promise(resolve => setTimeout(resolve, 10000));
    //获取页面内容 section,去除html标签
    const content = await page.$$eval(config.detailsSelector, (elements) => {
        return elements.map((element) => (element as HTMLElement).innerText);
    });
    const text = content.join('\n');
    console.log(text);
    //存储到数据库
    await Article.create({
        articleUrl: url,
        dataSourceId: config._id,
        content: text
    });
    await page.close();
    await browser.close();

}
async function getProxy() {
    const proxies = await import('fs/promises');
    const proxyList = (await proxies.readFile('./proxies.txt', 'utf8')).split('\n');
    const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    return randomProxy;
}