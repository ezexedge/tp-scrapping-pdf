// src/scraper/scraper.module.ts

import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { PrinterModule } from '../printer/printer.module';

@Module({
  imports: [PrinterModule],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
