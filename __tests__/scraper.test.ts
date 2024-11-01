import scrapeBlog from '../scraper/scrape'; // 调整路径
import IBlog from '../models/Iblog'; // 调整路径

describe('scrapeBlog function', () => {
    const config: IBlog = {
        blogUrl: 'http://www.coinbase.com',
        indexPage: '/en-sg/blog/landing',
        articleLinkSelector: 'section div.cds-flex-f1g67tkn.sc-20f7f24c-0.sc-3dcf3304-1.dxlxFg.dZjcVO a',
        nextpageSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div > div > button',
        detailsSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jqnGZy > section',
        _id: '001'
    };

    test('should return scraped article links', async () => {
        const links = await scrapeBlog(config);
        expect(links).toBeDefined(); // Ensure links is not undefined
        expect(Array.isArray(links)).toBe(true);
        expect(links!.length).toBeGreaterThan(0); // Use non-null assertion operator
        // 可以根据需要添加更多断言，检查链接的格式等
    });

    test('should handle errors gracefully', async () => {
        const invalidConfig: IBlog = {
            blogUrl: 'http://invalid-url.com',
            indexPage: '/nonexistent',
            articleLinkSelector: 'invalid-selector',
            nextpageSelector: 'invalid-selector',
            detailsSelector: 'invalid-selector',
            _id: '002'
        };

        await expect(scrapeBlog(invalidConfig)).rejects.toThrow(); // 确保在错误情况下抛出异常
    });
});
