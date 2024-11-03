"use strict";
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
const scrape_1 = __importDefault(require("../scraper/scrape")); // 调整路径
describe('scrapeBlog function', () => {
    const config = {
        blogUrl: 'http://www.coinbase.com',
        indexPage: '/en-sg/blog/landing',
        articleLinkSelector: 'section div.cds-flex-f1g67tkn.sc-20f7f24c-0.sc-3dcf3304-1.dxlxFg.dZjcVO a',
        nextpageSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div > div > button',
        detailsSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jqnGZy > section',
        _id: '001'
    };
    test('should return scraped article links', () => __awaiter(void 0, void 0, void 0, function* () {
        const links = yield (0, scrape_1.default)(config);
        expect(links).toBeDefined(); // Ensure links is not undefined
        expect(Array.isArray(links)).toBe(true);
        expect(links.length).toBeGreaterThan(0); // Use non-null assertion operator
        // 可以根据需要添加更多断言，检查链接的格式等
    }));
    test('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidConfig = {
            blogUrl: 'http://invalid-url.com',
            indexPage: '/nonexistent',
            articleLinkSelector: 'invalid-selector',
            nextpageSelector: 'invalid-selector',
            detailsSelector: 'invalid-selector',
            _id: '002'
        };
        yield expect((0, scrape_1.default)(invalidConfig)).rejects.toThrow(); // 确保在错误情况下抛出异常
    }));
});
