const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');

class Scryfall {
    browser = null;
    mainPage = null;
    data = {};

    config = {
        url : 'https://scryfall.com/sets',
        base_url: 'https://www.tcgplayer.com',
        onProgress: () => { },
        csvHeader: [
            { id: 'id', title: 'Product Id' },
            { id: 'cxid', title: 'Product Id' },
            { id: 'img', title: 'Product Image' },
            { id: 'name', title: 'Product Name' },
            { id: 'atk_def', title: 'ATK/DEF' },
            { id: 'attr', title: 'Attribute' },
            { id: 'text', title: 'Card Text' },
            { id: 'level', title: 'Level' },
            { id: 'type', title: 'Monster Type' },
            { id: 'passcode', title: 'Passcode' }


        ]
    };


    constructor() {
        this.init();
    }

    async init() {
        this.browser = await this.initializePuppeteer(this.config.url);
    }

    async initializePuppeteer() {

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome-stable',
            headless: true,
            args: [
                'no-sandbox',
                'disable-setuid-sandbox',
            ]
        });
        return browser;
    }

    async start(onfinish) {
        ///get urls
        if (!this.browser) await this.init();
        this.pagesLinks = await this.extactPagesLinks()

        //create data sheet
        this.data = this.pagesLinks.map(pl => {
            let id = pl.substring(0, pl.lastIndexOf('/'))
            id = id.substring(id.lastIndexOf('/') + 1)
            console.log(id);
            // 213s/theater-of-horrors
            return { id: id , url: pl };
        });




        for (var i = 0; i < 10 /*this.data.length*/; i++) {
            let item = await this.loadPageData(this.data[i]);
            if (this.onNewItem) this.onNewItem(item);
            this.data[i] = item;
            if (this.config.onProgress) this.config.onProgress(item, (i / this.data.length));
        }

        if (onfinish) onfinish(this.data);
        await this.close();
        return this.data;
    }

    async loadPageData(pageInfo) {
        console.log('getting info for :'.gray, pageInfo.id.green);
        const page = await this.browser.newPage();
        await page.goto(pageInfo.url);
        console.log(await page.$$eval('.card-text-title', cardText => cardText.map(l => l.innerText)));
        pageInfo['name'] = await page.$$eval('.card-text-title', cardText => cardText.map(l => l.innerText))
        console.log(pageInfo);
        await page.close();
        return pageInfo;
    }

    async extactPagesLinks() {
        console.log('going to '.gray, `${this.config.url}`.green);
        const page = await this.browser.newPage();
        console.log(this.config.url);
        await page.goto(this.config.url);
        // allSetLinks = await page.$eval)

        var allSetLinks = await page.evaluate(() => {
            var allSetLinks = [];
            let items = document.querySelectorAll('.checklist a:not(.pillbox-item)');
            items = Array.from(items);

            for (i in items) {
                let a = items[i];
                if (!(allSetLinks.indexOf(a.href) >= 0)) {
                    allSetLinks.push(a.href)
                }
            }
            return allSetLinks;
        });

        // console.log(allSetLinks)
        // const linkHrefs = await page.$$eval('.search-result__product', linkHrefs => linkHrefs.map(l => l.href));

        // console.log('Address loaded'.green);
        // await page.close();
        // console.log('Address loaded'.green);
        // // let links =  linkHrefs.map(l => `${this.config.base_url}${l}`);
        // console.log(links);
        var links = [];
        var i = 0;
        for (var setLink in allSetLinks){
            if( i++ > 10) break;
            await page.goto(allSetLinks[setLink]);
            var pageLinks = await page.$$eval('.card-grid-item-card', linkHrefs => linkHrefs.map(l => l.href))
            for(var pl in pageLinks)
                links.push(pageLinks[pl]);
        }
        console.log(links);
        return links;
    }
    async close() {
        await this.browser.close();
    }

}

module.exports = Scryfall;