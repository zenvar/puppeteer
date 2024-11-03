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
const scrape_1 = __importDefault(require("./scraper/scrape"));
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect('mongodb://localhost:27017/blogscraper');
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
});
// Call the connectDB function to establish the connection
connectDB();
const config = {
    blogUrl: 'http://www.coinbase.com',
    indexPage: '/en-sg/blog/landing',
    articleLinkSelector: 'section div.cds-flex-f1g67tkn.sc-20f7f24c-0.sc-3dcf3304-1.dxlxFg.dZjcVO a',
    nextpageSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div > div > button',
    detailsSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jqnGZy > section',
    _id: '001'
};
(0, scrape_1.default)(config)
    .then((links) => {
    console.log('Scraped links:', links);
})
    .catch((error) => {
    console.error('Error scraping blog:', error);
});
