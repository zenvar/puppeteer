<img src="https://github.com/zenvar/puppeteer/blob/main/pics/a-3d-clean-minimalism-design-logo-of-the-eye-of-pr-QtEwgdKATTeM6ckh8hw-SA-MW24cNULRGi27_o9mGYvrg-removebg-preview.png?raw=true" alt="alt text" style="width: 100px; height: 100px; text-align: center;"> 

# Web3 Blog Scraper

>**Preview URL: https://web3news.netlify.app/news**
(Deploy in the netlify)

![alt text](/pics/image.png)

This project is a **TypeScript + Puppeteer** blog scraper designed to extract article links and details from a specified blog. It connects to a **MongoDB database** to store the scraped data.It can **adjust the config selectors** to scrape different parts of the blog. Frontend is built with **Redwood.js frentend web**(https://github.com/zenvar/redwoodblog) and connected to the same MongoDB database.


## Features

- **Scrape Blog Articles**: Extracts article links and details from a specified blog URL.
- **MongoDB Integration**: Connects to a MongoDB database to store the scraped data.
- **Configurable Selectors**: Allows customization of CSS selectors for scraping different parts of the blog.Configured in `IBlog config`.
- **Proxy Support**: Supports using proxy pools to scrape the blog.Handle the IP blocking issue. Can configure to use the proxy pool in puppeteer `--proxy-server` option.
- **Error Handling and retries**: Handles errors gracefully and logs them to the console.
- **CI automated tests**: Set up a CI automated tests pipeline on GitHub Actions. Configured with `.github/workflows/ci.yml` file.

## Prerequisites

- Node.js (v14 or later,here is v21)
- MongoDB (running locally or accessible remotely)

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/blog-scraper.git
   cd blog-scraper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure MongoDB**:
   Ensure MongoDB is running locally or update the connection string in `main.ts` to point to your MongoDB instance.

4. **Run the scraper**:
   ```bash
   npm start
   ```
   or
   ```bash
   ts-node main.ts
   ```
   (which could be configured in package.json)

   Then you can see the console logs of the scraped data.
 
     ![alt text](/pics/aa93e5fa0a5cab4df14e439b1a335f9.png)

## Configuration

The scraper is configured using an `IBlog` object in `main.ts`. You can modify the following properties to suit your target blog:

- `blogUrl`: The base URL of the blog.
- `indexPage`: The path to the blog's landing page.
- `articleLinkSelector`: CSS selector to identify article links.
- `nextpageSelector`: CSS selector to identify the "next page" button.
- `detailsSelector`: CSS selector to identify article details.

for example:
```typescript
const config: IBlog = {
    blogUrl: 'http://www.coinbase.com',
    indexPage: '/en-sg/blog/landing',
    articleLinkSelector: 'section div.cds-flex-f1g67tkn.sc-20f7f24c-0.sc-3dcf3304-1.dxlxFg.dZjcVO a',
    nextpageSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div > div > button',
    detailsSelector: '#__next > div > div > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jxwgNN > div > div > div.cds-flex-f1g67tkn.sc-20f7f24c-0.jqnGZy > section',
    _id: '001'
};
```

Config2:

```typescript
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
```

## Usage

After running the scraper, the console will display the scraped links. Any errors encountered during the scraping process will also be logged to the console.

The data will be stored in the MongoDB database for further processing or analysis.

Can be visualized and managed in **Redwood.js built-in web dashboard**
Links:https://github.com/zenvar/redwoodblog
.(They should be connected to the same MongoDB database.)

![alt text](/pics/image-1.png)

![alt text](/pics/image-2.png)

![alt text](/pics/image-3.png)

![alt text](/pics/image-4.png)

![alt text](/pics/image-5.png)

![alt text](/pics/image-6.png)

![alt text](/pics/image-7.png)
