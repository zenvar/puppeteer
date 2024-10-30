interface IBlog {
    blogUrl: string; // The base URL of the blog
    indexPage: string; // The specific page to start scraping from
    articleLinkSelector: string; // A selector to find article links on the page
    _id: string; // An identifier for the data source, possibly a database ID
}

export default IBlog;
