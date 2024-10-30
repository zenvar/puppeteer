import puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import IBlog from '../models/Iblog';
import Article from '../models/Article';
import articleQueue from '../models/articleQueue';

export default async function scrapeBlog(
    config: IBlog,
    existingPage: Page | null = null,
    limit: number | null = null
) {

    //有头浏览器
    let browser = await puppeteer.launch({ headless: false });
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
        //await page.close();
        //await browser.close();
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
    }
    return blogLinks;
}

function StealthPlugin(): any {
    throw new Error('Function not implemented.');
}
