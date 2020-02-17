const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');

export default class Yugioh  { 
    browser = null;
    mainPage = null;
    data = {};

    config={
        url: "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&pid=14415003&rp=99999",
        base_url: 'https://www.db.yugioh-card.com',
        csvHeader: [
            {id: 'id', title: 'Product Id'},
            {id: 'img', title: 'Product Image'},
            {id: 'name', title: 'Product Name'},
            {id: 'atk_def', title: 'ATK/DEF'},
            {id: 'attr', title: 'Attribute'},
            {id: 'text', title: 'Card Text'},
            {id: 'level', title: 'Level'},
            {id: 'type', title: 'Monster Type'},
            {id: 'passcode', title: 'Passcode'}
        ]
    };
	constructor(){
        this.init();
    }

    async init(){
        this.browser = await this.initializePuppeteer(this.config.url);
    }

    async initializePuppeteer(){
        const browser = await puppeteer.launch();
        return browser;
    }

    async start(){
        ///get urls
        if(!this.browser) await this.init();
        this.pagesLinks = await this.extactPagesLinks();
        //create data sheet
        this.data = this.pagesLinks.map(pl=> {
            return {id: url.parse(pl, true).query.cid, url : pl};
        });

        for(var i=0; i < this.data.length; i++) 
            this.data[i] = await this.loadPageData(this.data[i]);
    }

    async loadPageData(pageInfo){
        return pageInfo;
    }

    async extactPagesLinks() {
        console.log('going to '.green, `${this.config.url}`.red);
        const page = await this.browser.newPage();
        await page.goto(this.config.url);
        console.log('Address loaded'.green);
        const linkHrefs = await page.$$eval('.box_list li .link_value', linkHrefs => linkHrefs.map(l => l.value));
        await page.close();
        return linkHrefs.map(l=> `${this.config.base_url}${l}`);
    }
    async close(){
        await this.browser.close();
    }

}