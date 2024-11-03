import { Page } from 'puppeteer';
import IBlog from '../models/Iblog';
import Article from '../models/Article';
import articleQueue from '../models/articleQueue';
import axios from 'axios';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import getProxy from '../utils/proxy'


// Add stealth plugin
puppeteer.use(StealthPlugin());

export default async function scrapeBlog(
    config: IBlog,
    existingPage: Page | null = null,
    //limit default 50
    limit: number | null = 50
) {
    const proxy = await getProxy();
    console.log("Using proxy:", proxy);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Ensure headless is true for testing
            //args: [`--proxy-server=${proxy}`]
        });
        let page = await browser.newPage();
        await page.goto(`${config.blogUrl}${config.indexPage}`, {
            waitUntil: "networkidle2",
            timeout: 160000 // Increase timeout
        });

        let totalLinks: string[] = [];
        let hasNextPage = true;
        // delay 2s
        await new Promise(resolve => setTimeout(resolve, 2000));

        while (hasNextPage && (!limit || totalLinks.length < limit)) {
            // Wait for the article links to load
            await page.waitForSelector(config.articleLinkSelector, { timeout: 15000 });

            let blogLinks = await page.$$eval(config.articleLinkSelector, (elements) => {
                return elements.map((element) => (element as HTMLAnchorElement).href);
            });

            //bloglink deduplicate
            blogLinks = [...new Set(blogLinks)];



            // Add new links to totalLinks
            totalLinks = totalLinks.concat(blogLinks);
            totalLinks = [...new Set(totalLinks)];
            console.log("Found links on current page:", totalLinks);


            // Check if we have reached the limit
            if (limit && totalLinks.length >= limit) {
                totalLinks = totalLinks.slice(0, limit);
                break;
            }

            // Check for the next page button and click it
            const nextPageButton = await page.$(config.nextpageSelector);
            if (nextPageButton) {
                await nextPageButton.click();
                //delay 2s
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                hasNextPage = false;
            }
        }

        const existingArticleLinks = await Article.find(
            { dataSourceId: config._id },
            'articleUrl'
        );
        const existingArticleLinksSet = new Set(
            existingArticleLinks.map((a) => a.articleUrl)
        );
        const newLinks = totalLinks.filter(
            (url: string) => !existingArticleLinksSet.has(url)
        );
        for (const url of newLinks) {
            console.log("Adding article to queue", url);
            //await articleQueue.add(url, { url, config });
            await retryScrapeDetails(url, config);
        }
        return totalLinks;
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
            //delay 2s
            await new Promise(resolve => setTimeout(resolve, 2000));
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
            headless: false,
            //args: [`--proxy-server=${proxy}`]
        });
        let page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Wait for the details to load
        await page.waitForSelector(config.detailsSelector, { timeout: 15000 });
        const header = await page.$eval(config.headerselector, el => el.textContent); 
        const time = await page.$eval(config.timeselector, el => el.textContent || "N/A");
        // reformat the time:(20\d{2}([\.\-/|年月\s]{1,3}\d{1,2}){2}日?(\s?\d{2}:\d{2}(:\d{2})?)?)|(\d{1,2}\s?(分钟|小时|天)前)
        const timeRegex = /(20\d{2}([\.\-/|年月\s]{1,3}\d{1,2}){2}日?(\s?\d{2}:\d{2}(:\d{2})?)?)|(\d{1,2}\s?(分钟|小时|天)前)/;
        const timeMatch = timeRegex.exec(time);
        let formattime;
        if (timeMatch) {
             formattime = timeMatch[0];// Full date
        }


        const html = await page.$$eval(config.detailsSelector, (elements) => {
            return elements.map((element) => {
                // 清理HTML内容函数
                function cleanHtmlContent(htmlContent: string): string {
                    // Create a new div to hold the cleaned content
                    const cleanDiv = document.createElement('div');
                    cleanDiv.innerHTML = htmlContent;
        
                    // Remove script and style elements
                    const scriptsAndStyles = cleanDiv.querySelectorAll('script, style');
                    scriptsAndStyles.forEach(el => el.remove());
        
                    // Remove all attributes from remaining elements except images
                    const allElements = cleanDiv.getElementsByTagName('*');
                    for (let el of Array.from(allElements)) {
                        if (el.tagName.toLowerCase() !== 'img') {
                            while (el.attributes.length > 0) {
                                el.removeAttribute(el.attributes[0].name);
                            }
                        }
                    }
        
                    // Convert specific elements to simpler ones (retain text structure)
                    const elementsToSimplify = cleanDiv.querySelectorAll('div, span, strong, em, i, b');
                    elementsToSimplify.forEach(el => {
                        const p = document.createElement('p');
                        p.innerHTML = el.innerHTML;
                        if (el.parentNode) {
                            el.parentNode.replaceChild(p, el);
                        }
                    });
        
                    return cleanDiv.innerHTML;
                }
        
                // 对当前 element 使用 cleanHtmlContent 函数
                return cleanHtmlContent(element.innerHTML);
            });
        });
        // Join the array of cleaned HTML strings into a single string
        const rawHtmlString = html.join('\n');

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
            content: text,
            header:header,
            time: formattime||time,
            rawHtml: rawHtmlString
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

