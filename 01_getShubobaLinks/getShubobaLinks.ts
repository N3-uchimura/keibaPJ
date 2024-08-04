/**
 * getShubobaLinks.ts
 *
 * function：get all links form shuboba-profile
**/

const BASE_URL: string = 'http://keiba.no.coocan.jp/data/_index_';
const FOREIGN_URL: string = 'a-z'; // target url

// read modules
import * as fs from 'fs'; // fs
import { Scrape } from './class/Scrape0804'; // scraper

// scraper
const scraper = new Scrape();

// number array
const makeNumberRange = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);

// main
(async (): Promise<void> => {
  try {
    // urls
    let urlArray: string[] = [];
    // initialize
    await scraper.init();
    // scraping loop
    for await (const i of makeNumberRange(1, 10)) {
      try {
        // filename
        const fileName: string = (new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14);
        // tmp url
        const tmpUrl: string = BASE_URL + String(i).padStart(2, '0') + '.html';
        // goto page
        await scraper.doGo(tmpUrl);
        // wait
        await scraper.doWaitFor(1000);
        // get data
        urlArray = await scraper.doMultiEval('a', 'href');
        // combined data
        const str: string = urlArray.join("\n");
        // write file
        await fs.promises.writeFile(`./txt/${fileName}.txt`, str)

      } catch (e) {
        console.log(e);
      }

    }
    // close browser
    await scraper.doClose();

  } catch (e) {
    console.log(e);
  }

})();
