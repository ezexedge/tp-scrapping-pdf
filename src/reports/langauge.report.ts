// src/reports/language.report.ts

import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { headerSection } from './header.section';

interface LanguageReportOptions {
  title?: string;
  subTitle?: string;
  combinedRanking: {
    position: number;
    pyplLanguage?: string;
    tiobeLanguage?: string;
  }[];
  highestPaidRanking: {
    ranking: number;
    indexDevLanguage?: string;
    geeksforGeeksLanguage?: string;
  }[];
  learningDifficultyRanking: {
    ranking: number;
    easyLanguage?: string;
    hardLanguage?: string;
  }[];
}

export const getLanguageReport = (
  options: LanguageReportOptions,
): TDocumentDefinitions => {
  const {
    title,
    subTitle,
    combinedRanking,
    highestPaidRanking,
    learningDifficultyRanking,
  } = options;

  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title: title ?? 'Reporte de Lenguajes de Programación',
      subTitle: subTitle ?? 'Popularidad, Salarios y Dificultad de Aprendizaje',
      showLogo: true,
      showDate: true,
    }),
    footer: '',
    pageMargins: [40, 110, 40, 60],
    content: [
      {
        text: '\n',
      },
      {
        text: 'Ranking de Popularidad',
        style: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
        },
      },
      {
        text: '\n',
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: [60, '*', '*'],
          body: [
            [
              { text: 'Posición', style: 'tableHeader' },
              { text: 'Ranking PYPL', style: 'tableHeader' },
              { text: 'Ranking TIOBE', style: 'tableHeader' },
            ],
            ...combinedRanking.map((lang) => [
              lang.position ? lang.position.toString() : 'N/A',
              lang.pyplLanguage || 'N/A',
              lang.tiobeLanguage || 'N/A',
            ]),
          ],
        },
      },
      {
        text: '\n',
      },
      {
        text: 'Ranking de Mejores Pagos',
        style: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
        },
      },
      {
        text: '\n',
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: [60, '*', '*'],
          body: [
            [
              { text: 'Posición', style: 'tableHeader' },
              { text: 'Index.dev', style: 'tableHeader' },
              { text: 'GeeksforGeeks', style: 'tableHeader' },
            ],
            ...highestPaidRanking.map((lang) => [
              lang.ranking ? lang.ranking.toString() : 'N/A',
              lang.indexDevLanguage || 'N/A',
              lang.geeksforGeeksLanguage || 'N/A',
            ]),
          ],
        },
      },
      {
        text: '\n',
      },
      {
        text: 'Ranking de Dificultad de Aprendizaje',
        style: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
        },
      },
      {
        text: '\n',
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: [60, '*', '*'],
          body: [
            [
              { text: 'Posición', style: 'tableHeader' },
              { text: 'digitalogy', style: 'tableHeader' },
              { text: 'linkedin', style: 'tableHeader' },
            ],
            ...learningDifficultyRanking.map((lang) => [
              lang.ranking ? lang.ranking.toString() : 'N/A',
              lang.easyLanguage || 'N/A',
              lang.hardLanguage || 'N/A',
            ]),
          ],
        },
      },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black',
      },
      headerTitle: {
        fontSize: 22,
        bold: true,
      },
      headerSubTitle: {
        fontSize: 16,
      },
      headerDate: {
        fontSize: 12,
      },
    },
  };
};
