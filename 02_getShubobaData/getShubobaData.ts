/**
 * getData.ts
 *
 * function：get all data from urls
**/

'use strict';

// read modules
import * as fs from 'fs'; // fs
import readline from 'readline'; // readline
import readlineSync from 'readline-sync'; // readsync
import { Scrape } from './class/Scrape0326'; // scraper
import CSV from './class/Csv0707'; // aggregator

// scraper
const scraper = new Scrape();
// aggregator
const csvMaker = new CSV('SJIS');

// read urls
const readLines = async (): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // urls
      let urls: string[] = new Array();
      // list files
      const fileList: string[] = await listFiles();
      // select file
      const targetfileName: string = await showDialog(fileList);
      // make readstream
      const rs: fs.ReadStream = fs.createReadStream(`./txt/${targetfileName}`);
      // config ure interface
      const rl: readline.Interface = readline.createInterface({
        // stream setting
        input: rs
      });

      // read one by one
      rl.on('line', (lineString: any) => {
        // push into array
        urls.push(lineString);
      });

      // close readline
      rl.on('close', () => {
        console.log("END!");
        // resolve
        resolve(urls);
      });

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// * general functions
// show diallog
const showDialog = (array: string[]): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // dialog options
      const index: number = readlineSync.keyInSelect(array, 'which file?');
      console.log(`read ${array[index]}.`);
      // return target filename
      resolve(array[index]);

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// list files
const listFiles = (): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // file list
      const fileNames: string[] = await fs.promises.readdir('./txt');
      // return filename array
      resolve(fileNames);

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// main
(async (): Promise<void> => {
  try {
    // variables
    let strArray: string[][] = [];
    // header
    const sheetTitleArray: string[] = ['馬名', '生日', '生国', '毛色', '供用', '勝鞍', '父', '母', '母父', 'インブリード', '海外産駒勝鞍', '国内産駒勝鞍'];
    // target selector
    const selectorArray: string[] = ['title', 'table tr:nth-child(1) td', 'table tr:nth-child(2) td', 'table tr:nth-child(3)  td', 'table tr:nth-child(4) td', 'table tr:nth-child(8) td', 'table tr:nth-child(12) td', 'table tr:nth-child(13) td', 'table tr:nth-child(14) td', 'table tr:nth-child(15) td', 'table tr:nth-child(23) td', 'table tr:nth-child(24) td'];
    // urls
    const linkArray: string[] = await readLines();

    // initialize
    await scraper.init();

    // 数字配列
    const makeNumberRange = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);

    // counter
    let counter: number = 0;
    // loop urls
    for (const url of linkArray) {
      console.log(`scraping...${counter}`);
      // goto shuboba-profile
      await scraper.doGo(url);

      // 格納用
      let myHorseObj: any = {
        馬名: '', // shopname
        生日: '', // genre
        生国: '', // status
        毛色: '', // budget
        供用: '', // shopphone
        勝鞍: '', // address
        父: '', // business time
        母: '', // holiday
        母父: '', // seat
        インブリード: '', // seat
        海外産駒勝鞍: '', // seat
        国内産駒勝鞍: '', // seat
      };
      // loop in selectors
      for await (const i of makeNumberRange(0, 11)) {
        // result
        const result: string = await scraper.doSingleEval(selectorArray[i], 'textContent');
        // get into array
        myHorseObj[sheetTitleArray[i]] = result;
      }
      // push to tmp array
      strArray.push(myHorseObj);
      // increment
      counter++;
    }

    // filename
    const fileName: string = (new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14);
    // filepath
    const filePath: string = `./csv/${fileName}.csv`;
    // write data
    await csvMaker.makeCsvData(strArray, filePath);

    // close browser
    await scraper.doClose();

  } catch (e: unknown) {
    // error
    console.log(e);
  }

})();