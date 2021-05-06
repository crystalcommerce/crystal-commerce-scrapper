const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');
const { framework } = require('passport');
var isWin = process.platform === "win32";

class WSTCG {
    browser = null;
    mainPage = null;
    data = [];
    config = {
        url: 'https://en.ws-tcg.com/cardlist/list/?cardno=MR/W80-E001',
        base_url: 'https://en.ws-tcg.com/',
        onProgress: () => { },
        csvHeader: [
            { id: 'productName', title: 'Product Name', xPath: `//*[@id="cardDetail"]/table/tbody/tr[1]/td[2]` },
            { id: 'cardName', title: 'Card Name', xPath: `//*[@id="cardDetail"]/table/tbody/tr[1]/td[2]` },
            { id: 'cardNumber', title: 'Card Number', xPath: `//*[@id="cardDetail"]/table/tbody/tr[2]/td[1]` },
            { id: 'cardText', title: 'Card Text', xPath: `//*[@id="cardDetail"]/table/tbody/tr[8]/td` },
            { id: 'color', title: 'Color', xPath: `//*[@id="cardDetail"]/table/tbody/tr[4]/td[2]` },
            { id: 'cost', title: 'Cost', xPath: `//*[@id="cardDetail"]/table/tbody/tr[5]/td[2]` },
            { id: 'level', title: 'Level', xPath: `//*[@id="cardDetail"]/table/tbody/tr[5]/td[1]` },
            { id: 'power', title: 'Power', xPath: `//*[@id="cardDetail"]/table/tbody/tr[6]/td[1]` },
            { id: 'rarity', title: 'Rarity', xPath: `//*[@id="cardDetail"]/table/tbody/tr[2]/td[2]` },
            { id: 'setName', title: 'Set Name', xPath: `//*[@id="cardDetail"]/table/tbody/tr[1]/td[2]` },
            { id: 'side', title: 'Side', xPath: `//*[@id="cardDetail"]/table/tbody/tr[3]/td[2]` },
            { id: 'soul', title: 'Soul', xPath: `//*[@id="cardDetail"]/table/tbody/tr[6]/td[2]` },
            { id: 'traits', title: 'Traits', xPath: `//*[@id="cardDetail"]/table/tbody/tr[6]/td[2]` },
            { id: 'trigger', title: 'Trigger', xPath: `//*[@id="cardDetail"]/table/tbody/tr[7]/td[1]` },
            { id: 'type', title: 'Type', xPath: `//*[@id="cardDetail"]/table/tbody/tr[4]/td[1]` },
        ]
    };


    constructor() {
        // this.init();
    }

    async init() {
        this.browser = await this.initializePuppeteer(this.config.url);
    }

    async initializePuppeteer() {
        let config = {
            headless: true,
            args: [
                'no-sandbox',
                'disable-setuid-sandbox',
            ]
        };

        if (!isWin)
            config.executablePath = '/usr/bin/google-chrome-stable';


        const browser = await puppeteer.launch(config);
        return browser;
    }

    async start(onfinish) {
        ///get urls
        if (!this.browser) await this.init();

        if (!this.data) this.data = [];
        const page = await this.browser.newPage();
        await page.goto(this.config.url);

        while (true) {
            try {
                await page.waitForTimeout(2000);
                let rowData = {};
                for (let i in this.config.csvHeader) {
                    let col = this.config.csvHeader[i];
                    if (col.id == 'productName') {
                        col = this.config.csvHeader[1];
                        var [elem] = await page.$x(col.xPath);
                        let productName = '';
                        if(elem){
                            productName = await page.evaluate(name => name.innerText, elem);
                        }

                        col = this.config.csvHeader[2];
                        var [elem2] = await page.$x(col.xPath);
                        if(elem2){
                            productName += "-"  + await page.evaluate(name => name.innerText, elem2);
                        }


                        col = this.config.csvHeader[8];
                        var [elem3] = await page.$x(col.xPath);
                        if(elem3){
                            productName += "-"  + await page.evaluate(name => name.innerText, elem3);
                        }

                        rowData["productName"] = productName;

                    } else {
                        const [elem] = await page.$x(col.xPath);
                        if (elem) {
                            try {
                                let text = await page.evaluate(name => name.innerText, elem);

                                text = text.replace(/[^0-9a-z ]/gi, '')
                                rowData[col.id] = text;

                                // await page.evaluate(name => name.innerText, elem);
                            } catch (ex) {
                                console.log(ex);
                            }
                        }
                    }
                    
                }

                this.data.push(rowData)
                this.config.csvHeader

                const [button] = await page.$x("//a[contains(., 'next')]");
                if (button) {
                    await button.click();
                }
                else {
                    break;
                }
            } catch (ex) {
                console.log(ex);
                break;
            }

        }
        await page.waitForTimeout(4000);
        console.log(this.data);
        if (onfinish) onfinish(this.data);

        await page.close();
        console.log("closing pages");
        await this.close();
        return this.data;
    }

    async close() {
        await this.browser.close();
    }

}

module.exports = WSTCG;