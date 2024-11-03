import scrapeBlog from './scraper/scrape';
import IBlog from './models/Iblog';
import mongoose from 'mongoose';
import Article from './models/Article'; // Adjust the path as necessary

    const connectDB = async () => {
        try {
            await mongoose.connect('mongodb://localhost:27017/blogscraper');
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
    detailsSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jqnGZy > section',
    timeselector: '#article_introduction > header > div > div > div:nth-child(1) > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.ioIUsw > div.cds-flex-f1g67tkn.sc-20f7f24c-0.hjdKBS > p:nth-child(2)',
    headerselector: 'h1',
    _id: '001'
};

scrapeBlog(config)
    .then((links) => {
        console.log('Scraped links:', links);
    })
    .catch((error) => {
        console.error('Error scraping blog:', error);
    });


