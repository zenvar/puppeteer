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
    blogUrl: 'https://www.coinbase.com',
    indexPage: '/en-sg/blog/landing',
    articleLinkSelector: 'a.dMNygt',
    _id: 'uniqueDataSourceId'
};

scrapeBlog(config)
    .then((links) => {
        console.log('Scraped links:', links);
    })
    .catch((error) => {
        console.error('Error scraping blog:', error);
    });


