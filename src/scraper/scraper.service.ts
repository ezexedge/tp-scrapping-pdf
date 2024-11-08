// src/scraper/scraper.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PrinterService } from '../printer/printer.service';
import * as fs from 'fs';
import * as path from 'path';
import { getLanguageReport } from 'src/reports/langauge.report';

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);
  private browser: puppeteer.Browser;

  constructor(private readonly printerService: PrinterService) {}

  async onModuleInit() {
    try {
      this.logger.log('Iniciando el navegador para scraping');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.log('Navegador lanzado exitosamente');
      await this.executeScrapes();
    } catch (error) {
      this.logger.error('Error al inicializar ScraperService', error);
    }
  }

  private async executeScrapes() {
    const processingInterval = setInterval(() => {
      this.logger.log('Procesando... el scraping está en curso');
    }, 5000);

    try {
      const [
        pyplRanking,
        tiobeRanking,
        geeksforGeeksRanking,
        indexDevRanking,
        easiestToLearnRanking,
        hardestToLearnRanking,
      ] = await Promise.all([
        this.getPyplRanking(),
        this.getTiobeRanking(),
        this.getGeeksForGeeksHighestPayingLanguages(),
        this.getWithCodeExampleHighPayingLanguages(),
        this.getDigitalogyProgrammingLanguages(),
        this.getLinkedInProgrammingLanguages(),
      ]);

      this.logger.log(
        'Scraping de PYPL, TIOBE, Mejores Pagos, Facil y Dificil completado.',
      );

      const combinedRanking = this.combineRankingsByPosition(
        pyplRanking,
        tiobeRanking,
      );

      const highestPaidRanking = this.combineHighestPaidRankings(
        geeksforGeeksRanking,
        indexDevRanking,
      );

      const learningDifficultyRanking = this.combineLearningDifficultyRankings(
        easiestToLearnRanking,
        hardestToLearnRanking,
      );

      const docDefinition = getLanguageReport({
        combinedRanking,
        highestPaidRanking,
        learningDifficultyRanking,
        title: 'Reporte de Lenguajes de Programación',
        subTitle: 'Popularidad, Salarios y Dificultad de Aprendizaje',
      });

      this.logger.log('Generando PDF...');
      const pdfDoc = this.printerService.createPdf(docDefinition);
      const pdfPath = path.join(
        __dirname,
        '../../reports/language_rankings.pdf',
      );

      const writeStream = fs.createWriteStream(pdfPath);
      pdfDoc.pipe(writeStream);
      pdfDoc.end();

      writeStream.on('finish', () => {
        this.logger.log(`PDF generado exitosamente en ${pdfPath}`);
      });
    } catch (error) {
      this.logger.error(
        'Error durante la ejecución de scrapes o generación de PDF',
        error,
      );
    } finally {
      clearInterval(processingInterval); // Detener el temporizador cuando finalice el proceso
      this.logger.log('Proceso de scraping completado.');
    }
  }

  private combineLearningDifficultyRankings(
    easiest: { ranking: string; language: string }[],
    hardest: { ranking: string; language: string }[],
  ): {
    ranking: number;
    easyLanguage?: string;
    hardLanguage?: string;
  }[] {
    const maxLength = Math.max(easiest.length, hardest.length);
    const combined: {
      ranking: number;
      easyLanguage?: string;
      hardLanguage?: string;
    }[] = [];

    for (let i = 0; i < maxLength; i++) {
      combined.push({
        ranking: i + 1,
        easyLanguage: easiest[i]?.language || 'N/A',
        hardLanguage: hardest[i]?.language || 'N/A',
      });
    }

    return combined;
  }

  private combineRankingsByPosition(
    pypl: { ranking: string; language: string }[],
    tiobe: { ranking: string; language: string }[],
  ): {
    position: number;
    pyplLanguage?: string;
    tiobeLanguage?: string;
  }[] {
    const maxLength = Math.max(pypl.length, tiobe.length);
    const combined: {
      position: number;
      pyplLanguage?: string;
      tiobeLanguage?: string;
    }[] = [];

    for (let i = 0; i < maxLength; i++) {
      combined.push({
        position: i + 1,
        pyplLanguage: pypl[i]?.language || 'N/A',
        tiobeLanguage: tiobe[i]?.language || 'N/A',
      });
    }

    return combined;
  }

  private combineHighestPaidRankings(
    geeksforGeeks: { ranking: string; language: string }[],
    indexDev: { ranking: string; language: string }[],
  ): {
    ranking: number;
    geeksforGeeksLanguage?: string;
    indexDevLanguage?: string;
  }[] {
    const maxLength = Math.max(geeksforGeeks.length, indexDev.length);
    const combined: {
      ranking: number;
      geeksforGeeksLanguage?: string;
      indexDevLanguage?: string;
    }[] = [];

    for (let i = 0; i < maxLength; i++) {
      combined.push({
        ranking: i + 1,
        geeksforGeeksLanguage: geeksforGeeks[i]?.language || 'N/A',
        indexDevLanguage: indexDev[i]?.language || 'N/A',
      });
    }

    return combined;
  }

  private async getPyplRanking(): Promise<any[]> {
    this.logger.log('Iniciando el proceso de scraping de PYPL');

    try {
      const page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto('https://pypl.github.io/PYPL.html', {
        waitUntil: 'networkidle2',
      });

      await page.waitForSelector('table');

      const rankings = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map((row) => {
          const cols = row.querySelectorAll('td');
          return {
            ranking: cols[0]?.innerText.trim(),
            language: cols[2]?.innerText.trim(),
          };
        });
      });

      this.logger.log('Scraping completado con éxito de PYPL');
      return rankings.filter((val) => Number(val.ranking) <= 10);
    } catch (error) {
      this.logger.error('Error durante el scraping de PYPL', error);
      throw error;
    }
  }

  private async getTiobeRanking(): Promise<any[]> {
    this.logger.log('Iniciando scraping de TIOBE');
    const page = await this.browser.newPage();

    try {
      await page.setDefaultNavigationTimeout(0);
      await page.goto('https://www.tiobe.com/tiobe-index/', {
        waitUntil: 'networkidle2',
      });
      await page.waitForSelector('.table-top20');

      const rankings: any[] = await page.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll('.table-top20 tbody tr'),
        );
        return rows
          .map((row) => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 6) {
              return {
                ranking: cols[0].innerText.trim(),
                language: cols[4].innerText.trim(),
              };
            }
          })
          .filter((item) => item !== undefined);
      });

      this.logger.log('Datos extraídos de TIOBE');
      return rankings.filter((val) => Number(val.ranking) <= 10);
    } catch (error) {
      this.logger.error('Error durante el scraping de TIOBE', error);
      return [];
    } finally {
      await page.close();
    }
  }

  private async getGeeksForGeeksHighestPayingLanguages(): Promise<any[]> {
    this.logger.log('Iniciando el proceso de scraping de GeeksforGeeks');

    try {
      const page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(
        'https://www.geeksforgeeks.org/highest-paying-programming-languages-2024/',
        {
          waitUntil: 'networkidle2',
        },
      );
      await page.waitForSelector('body');

      const languagesData = await page.evaluate(() => {
        const content = document.body.innerText;
        const regex = /\d+\.\s([A-Za-z\+\#]+)/g;
        const matches = [...content.matchAll(regex)];
        return matches.map((match, index) => ({
          ranking: (index + 1).toString(),
          language: match[1].trim(),
        }));
      });

      this.logger.log('Scraping completado con éxito para GeeksforGeeks');
      return languagesData.filter((val) => Number(val.ranking) <= 10);
    } catch (error) {
      this.logger.error('Error durante el scraping de GeeksforGeeks', error);
      throw error;
    } finally {
    }
  }

  private async getWithCodeExampleHighPayingLanguages(): Promise<any[]> {
    this.logger.log('Iniciando el proceso de scraping de withcodeexample.com');

    try {
      const page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(
        'https://golang.withcodeexample.com/blog/top-highest-paying-programming-languages-to-learn-in-2024/',
        {
          waitUntil: 'networkidle2',
        },
      );
      await page.waitForSelector('body');

      const languagesData = await page.evaluate(() => {
        const content = document.body.innerText;
        const regex = /\d+\.\s([A-Za-z\+\#]+)/g; // similar regex para capturar los lenguajes
        const matches = [...content.matchAll(regex)];
        return matches.map((match, index) => ({
          ranking: (index + 1).toString(),
          language: match[1].trim(),
        }));
      });

      this.logger.log('Scraping completado con éxito para withcodeexample.com');
      let count = 1;
      const languagesDataMoodified = languagesData
        .reverse()
        .map((val) => ({ ranking: count++, language: val.language }));
      return languagesDataMoodified.filter((val) => Number(val.ranking) <= 10);
    } catch (error) {
      this.logger.error(
        'Error durante el scraping de withcodeexample.com',
        error,
      );
      throw error;
    }
  }

  private async getDigitalogyProgrammingLanguages(): Promise<any[]> {
    this.logger.log('Iniciando el proceso de scraping de Digitalogy');

    try {
      const page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(
        'https://www.digitalogy.co/blog/programming-languages-from-easy-to-hard/',
        {
          waitUntil: 'networkidle2',
        },
      );
      await page.waitForSelector('body');

      const languagesData = await page.evaluate(() => {
        const content = document.body.innerText;
        const regex = /\d+\.\s([A-Za-z\+\#]+)/g;
        const matches = [...content.matchAll(regex)];
        return matches.map((match, index) => ({
          ranking: (index + 1).toString(),
          language: match[1].trim(),
        }));
      });

      this.logger.log('Scraping completado con éxito para Digitalogy');
      return languagesData;
    } catch (error) {
      this.logger.error('Error durante el scraping de Digitalogy', error);
      throw error;
    }
  }

  private async getLinkedInProgrammingLanguages(): Promise<any[]> {
    this.logger.log('Iniciando el proceso de scraping de LinkedIn');

    try {
      const page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(
        'https://www.linkedin.com/pulse/navigating-learning-curve-definitive-ranking-languages-ibrahim-khalil/',
        {
          waitUntil: 'networkidle2',
        },
      );
      await page.waitForSelector('body');

      const languagesData = await page.evaluate(() => {
        const content = document.body.innerText;
        const regex = /\d+\.\s([A-Za-z\+\#]+)/g; // Expresión regular para capturar los lenguajes
        const matches = [...content.matchAll(regex)];
        return matches.map((match, index) => ({
          ranking: (index + 1).toString(),
          language: match[1].trim(),
        }));
      });

      this.logger.log('Scraping completado con éxito para LinkedIn');
      return languagesData;
    } catch (error) {
      this.logger.error('Error durante el scraping de LinkedIn', error);
      throw error;
    }
  }
}
