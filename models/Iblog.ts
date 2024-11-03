interface IBlog {
    blogUrl: string; // The base URL of the blog
    indexPage: string; // The specific page to start scraping from
    articleLinkSelector: string; // A selector to find article links on the page
    nextpageSelector: string; // A selector to find next page on the page
    _id: string; // An identifier for the data source, possibly a database ID
    timeselector: string; 
    headerselector: string;
    detailsSelector: string; // A selector to find article details on the page
}

export default IBlog;
