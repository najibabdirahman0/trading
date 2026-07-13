export type AssetCategory = 'stock' | 'crypto' | 'forex' | 'indices';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  description: string;
}

export type ExportFormat = 'JSON_PRETTY' | 'JSON_MIN' | 'CSV' | 'TSV';
export type DateFormatOption = 'unix' | 'iso' | 'locale';

export interface ExportConfig {
  format: ExportFormat;
  includeHeaders: boolean;
  dateFormat: DateFormatOption;
  selectedFields: string[]; // ['time', 'open', 'high', 'low', 'close', 'volume']
  precision: number;
}

export interface ExportHistoryItem {
  id: string;
  timestamp: number;
  symbol: string;
  interval: string;
  rowsCount: number;
  format: ExportFormat;
  content: string;
}
