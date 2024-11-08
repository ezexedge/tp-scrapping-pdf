// src/reports/header.section.ts

import { Content } from 'pdfmake/interfaces';

const logo: Content = {
  image: 'src/assets/logo.png', // Asegúrate de que esta ruta sea correcta
  width: 220,
  height: 80,
  alignment: 'center',
  margin: [0, 0, 0, 20],
};

const currentDate: Content = {
  text: new Date().toLocaleDateString(),
  alignment: 'right',
  margin: [20, 30],
  width: 150,
};

interface HeaderOptions {
  title?: string;
  subTitle?: string;
  showLogo?: boolean;
  showDate?: boolean;
}

export const headerSection = (options: HeaderOptions): Content => {
  const { title, subTitle, showLogo = true, showDate = true } = options;

  const headerLogo: Content = showLogo ? logo : null;
  const headerDate: Content = showDate ? currentDate : null;

  const headerSubTitle: Content = subTitle
    ? {
        text: subTitle,
        alignment: 'center',
        margin: [0, 2, 0, 0],
        style: {
          fontSize: 16,
          bold: true,
        },
      }
    : null;

  const headerTitle: Content = title
    ? {
        stack: [
          {
            text: title,
            alignment: 'center',
            margin: [0, 15, 0, 0],
            style: {
              bold: true,
              fontSize: 22,
            },
          },
          headerSubTitle,
        ],
      }
    : null;

  return {
    columns: [headerLogo, headerTitle, headerDate],
  };
};
