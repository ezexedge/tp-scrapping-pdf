# Scrapping TP

## Descripción

Este proyecto es una aplicación de scraping construida con [NestJS](https://nestjs.com/) que utiliza [Puppeteer](https://pptr.dev/) para extraer datos de diferentes fuentes web. Los datos recopilados incluyen rankings de lenguajes de programación populares, mejor pagados, y dificultad de aprendizaje. Una vez extraídos, los datos se combinan y generan en un reporte PDF usando [pdfmake](http://pdfmake.org/).

## Funcionalidades

- **Scraping de datos**: Extrae información sobre lenguajes de programación populares, mejor pagados y dificultad de aprendizaje desde múltiples fuentes web.
- **Generación de PDF**: Combina los datos extraídos en un reporte PDF que se almacena en la carpeta `reports` del proyecto.
- **Registro de logs**: Utiliza un temporizador que indica cada 5 segundos que el scraping está en proceso, y se registran mensajes al iniciar y finalizar.

## Requisitos previos

Para ejecutar este proyecto, necesitas tener instalados los siguientes elementos:

1. **Node.js** (versión 14 o superior)
2. **npm** (viene con Node.js) o **yarn** para gestionar dependencias.
3. **NestJS CLI** (opcional, pero recomendado para desarrollo).

Para instalar el CLI de NestJS:

```bash
npm install -g @nestjs/cli

. **Clona el repositorio**:

   ```bash
   git clone https://github.com/ezexedge/tp-scrapping-pdf.git
   cd tp-scrapping-pdf
