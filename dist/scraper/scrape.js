"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = scrapeBlog;
const Article_1 = __importDefault(require("../models/Article"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
// Add stealth plugin
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
function scrapeBlog(config_1) {
    return __awaiter(this, arguments, void 0, function* (config, existingPage = null, 
    //limit default 50
    limit = 50) {
        const proxy = yield getProxy();
        console.log("Using proxy:", proxy);
        let browser;
        try {
            browser = yield puppeteer_extra_1.default.launch({
                headless: true, // Ensure headless is true for testing
                //args: [`--proxy-server=${proxy}`]
            });
            let page = yield browser.newPage();
            yield page.goto(`${config.blogUrl}${config.indexPage}`, {
                waitUntil: "networkidle2",
                timeout: 160000 // Increase timeout
            });
            let totalLinks = [];
            let hasNextPage = true;
            // delay 2s
            yield new Promise(resolve => setTimeout(resolve, 2000));
            while (hasNextPage && (!limit || totalLinks.length < limit)) {
                // Wait for the article links to load
                yield page.waitForSelector(config.articleLinkSelector, { timeout: 15000 });
                let blogLinks = yield page.$$eval(config.articleLinkSelector, (elements) => {
                    return elements.map((element) => element.href);
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
                const nextPageButton = yield page.$(config.nextpageSelector);
                if (nextPageButton) {
                    yield nextPageButton.click();
                    //delay 2s
                    yield new Promise(resolve => setTimeout(resolve, 2000));
                }
                else {
                    hasNextPage = false;
                }
            }
            const existingArticleLinks = yield Article_1.default.find({ dataSourceId: config._id }, 'articleUrl');
            const existingArticleLinksSet = new Set(existingArticleLinks.map((a) => a.articleUrl));
            const newLinks = totalLinks.filter((url) => !existingArticleLinksSet.has(url));
            for (const url of newLinks) {
                console.log("Adding article to queue", url);
                //await articleQueue.add(url, { url, config });
                yield retryScrapeDetails(url, config);
            }
            return totalLinks;
        }
        catch (error) {
            console.error("Error during scraping blog:", error);
        }
        finally {
            if (browser) {
                yield browser.close();
            }
        }
    });
}
function retryScrapeDetails(url_1, config_1) {
    return __awaiter(this, arguments, void 0, function* (url, config, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                //delay 2s
                yield new Promise(resolve => setTimeout(resolve, 2000));
                yield scrapeDetails(url, config);
                break; // Exit loop if successful
            }
            catch (error) {
                console.error(`Attempt ${attempt} failed for ${url}:`, error);
                if (attempt === retries) {
                    console.error(`Failed to scrape details for ${url} after ${retries} attempts.`);
                }
            }
        }
    });
}
function scrapeDetails(url, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const proxy = yield getProxy();
        console.log("Using proxy:", proxy);
        let browser;
        try {
            browser = yield puppeteer_extra_1.default.launch({
                headless: true,
                //args: [`--proxy-server=${proxy}`]
            });
            let page = yield browser.newPage();
            yield page.goto(url, { waitUntil: "networkidle2" });
            // Wait for the details to load
            yield page.waitForSelector(config.detailsSelector, { timeout: 15000 });
            const html = yield page.$$eval(config.detailsSelector, (elements) => {
                return elements.map((element) => {
                    // Create a new div to hold the cleaned content
                    const cleanDiv = document.createElement('div');
                    cleanDiv.innerHTML = element.innerHTML;
                    // Remove script and style elements
                    const scriptsAndStyles = cleanDiv.querySelectorAll('script, style');
                    scriptsAndStyles.forEach(el => el.remove());
                    // Remove all attributes from remaining elements
                    const allElements = cleanDiv.getElementsByTagName('*');
                    for (let el of allElements) {
                        while (el.attributes.length > 0) {
                            el.removeAttribute(el.attributes[0].name);
                        }
                    }
                    // Convert specific elements to simpler ones
                    const elementsToSimplify = cleanDiv.querySelectorAll('div, span, strong, em, i, b');
                    elementsToSimplify.forEach(el => {
                        const p = document.createElement('p');
                        p.innerHTML = el.innerHTML;
                        if (el.parentNode) {
                            el.parentNode.replaceChild(p, el);
                        }
                    });
                    return cleanDiv.innerHTML;
                });
            });
            // Join the array of cleaned HTML strings into a single string
            const rawHtmlString = html.join('\n');
            //获取页面内容 section,去除html标签
            const content = yield page.$$eval(config.detailsSelector, (elements) => {
                return elements.map((element) => element.innerText);
            });
            const text = content.join('\n');
            //console.log(text);
            //存储到数据库
            yield Article_1.default.create({
                articleUrl: url,
                dataSourceId: config._id,
                content: text,
                rawHtml: rawHtmlString
            });
            //find db article count
            const articleCount = yield Article_1.default.countDocuments({ dataSourceId: config._id });
            console.log("Added to the database! current count:", articleCount);
        }
        catch (error) {
            console.error("Error during scraping details:", error);
            throw error; // Re-throw error to handle retries
        }
        finally {
            if (browser) {
                yield browser.close();
            }
        }
    });
}
function getProxy() {
    return __awaiter(this, void 0, void 0, function* () {
        const proxies = yield Promise.resolve().then(() => __importStar(require('fs/promises')));
        const proxyList = (yield proxies.readFile('./proxies.txt', 'utf8')).split('\n');
        const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
        return randomProxy;
    });
}
