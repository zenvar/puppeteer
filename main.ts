import scrapeBlog from './scraper/scrape';
import IBlog from './models/Iblog';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Article from './models/Article'; // Adjust the path as necessary

const connectDB = async () => {
    try {
        const MongoDB_URI = process.env.DATABASE_URL as string;

        if (!MongoDB_URI) {
            throw new Error("DATABASE_URL environment variable is not set");
        }
        await mongoose.connect(MongoDB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Call the connectDB function to establish the connection
connectDB();

const config: IBlog = {
    blogUrl: 'http://www.coinbase.com',
    indexPage: '/en-sg/blog/landing',
    articleLinkSelector: 'section div.cds-flex-f1g67tkn.sc-20f7f24c-0.sc-3dcf3304-1.dxlxFg.dZjcVO a',
    nextpageSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div > div > button',
    detailsSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jqnGZy section',
    timeselector: '#article_introduction > header > div > div > div:nth-child(1) > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.ioIUsw > div.cds-flex-f1g67tkn.sc-20f7f24c-0.hjdKBS > p:nth-child(2)',
    headerselector: 'h1',
    _id: '001'
};

const config2: IBlog = {
    blogUrl: 'https://crypto.com/',
    indexPage: '/trending',
    articleLinkSelector: 'div.card-frame a.card-box-image',
    nextpageSelector: 'div.contianer-button',
    detailsSelector: '#gatsby-focus-wrapper > div > main > div > div.article-container > div.article-box',
    timeselector: 'span.article-university-details-date, p.card-event-detail-date',
    headerselector: 'h1',
    _id: 'crypto.com'
}

const configList = [ config2] as IBlog[]

configList.forEach(config => {
    scrapeBlog(config)
        .then((links) => {
            console.log('Scraped links:', links);
        })
        .catch((error) => {
            console.error('Error scraping blog:', error);
        });
}
)


