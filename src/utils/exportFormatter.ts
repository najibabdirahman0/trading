import { ExportConfig, ExportFormat } from '../types';

/**
 * Formats raw TradingView exportData structure into CSV, TSV, or JSON based on config.
 */
export function formatExportData(rawData: any, config: ExportConfig): { formattedString: string; rowsCount: number } {
  if (!rawData) {
    return { formattedString: '', rowsCount: 0 };
  }

  // Handle standard TradingView format with schema and data array
  let headers: string[] = [];
  let rows: any[][] = [];

  if (rawData.schema && Array.isArray(rawData.schema) && Array.isArray(rawData.data)) {
    headers = rawData.schema.map((field: any) => field.id || field.name || 'field');
    rows = rawData.data;
  } else if (Array.isArray(rawData)) {
    // If it's already an array of objects
    if (rawData.length > 0) {
      headers = Object.keys(rawData[0]);
      rows = rawData.map((obj: any) => headers.map(h => obj[h]));
    }
  } else if (typeof rawData === 'object') {
    // If it has arrays of keys (e.g. { time: [...], open: [...] })
    const keys = Object.keys(rawData);
    if (keys.length > 0 && Array.isArray(rawData[keys[0]])) {
      headers = keys;
      const length = rawData[keys[0]].length;
      for (let i = 0; i < length; i++) {
        const row = keys.map(k => rawData[k][i]);
        rows.push(row);
      }
    }
  }

  // Fallback: if we couldn't parse structured rows, serialize raw input
  if (headers.length === 0 || rows.length === 0) {
    const rawJsonStr = JSON.stringify(rawData, null, 2);
    return {
      formattedString: rawJsonStr,
      rowsCount: Array.isArray(rawData) ? rawData.length : 1
    };
  }

  // Map header index to track column selections
  const fieldIndices = headers.map((h, idx) => ({ header: h, index: idx }));
  
  // Filter active headers based on selectedFields config
  const activeFields = fieldIndices.filter(item => 
    config.selectedFields.length === 0 || config.selectedFields.includes(item.header.toLowerCase())
  );

  const finalHeaders = activeFields.map(item => item.header);

  // Map and process each row
  const processedRows = rows.map((row) => {
    return activeFields.map((fieldItem) => {
      const val = row[fieldItem.index];
      const fieldLower = fieldItem.header.toLowerCase();

      // Handle Date formatting for time/date columns
      if (fieldLower === 'time' || fieldLower === 'date') {
        const numVal = Number(val);
        if (!isNaN(numVal)) {
          // TradingView timestamps might be in seconds or milliseconds
          const ms = numVal < 500000000000 ? numVal * 1000 : numVal;
          const dateObj = new Date(ms);

          switch (config.dateFormat) {
            case 'iso':
              return dateObj.toISOString();
            case 'locale':
              return dateObj.toLocaleString();
            case 'unix':
            default:
              return Math.floor(ms / 1000).toString();
          }
        }
      }

      // Handle numbers and decimal precision rounding
      if (typeof val === 'number') {
        // If it's a field like volume, maybe we don't round with decimals if it is integer
        if (fieldLower === 'volume') {
          return Math.round(val).toString();
        }
        return val.toFixed(config.precision);
      }

      // Return string representation
      return val !== undefined && val !== null ? String(val) : '';
    });
  });

  let outputText = '';

  switch (config.format) {
    case 'JSON_PRETTY':
    case 'JSON_MIN': {
      const jsonArr = processedRows.map((row) => {
        const obj: Record<string, any> = {};
        finalHeaders.forEach((header, idx) => {
          const val = row[idx];
          // Try to cast back to numeric where applicable for strict JSON typing
          if (header.toLowerCase() !== 'time' && header.toLowerCase() !== 'date' && !isNaN(Number(val)) && val !== '') {
            obj[header] = Number(val);
          } else {
            obj[header] = val;
          }
        });
        return obj;
      });

      outputText = config.format === 'JSON_PRETTY' 
        ? JSON.stringify(jsonArr, null, 2)
        : JSON.stringify(jsonArr);
      break;
    }

    case 'CSV':
    case 'TSV': {
      const separator = config.format === 'CSV' ? ',' : '\t';
      const lines: string[] = [];

      if (config.includeHeaders) {
        lines.push(finalHeaders.join(separator));
      }

      processedRows.forEach((row) => {
        // Escape quotes/separators if needed
        const escapedRow = row.map((cell) => {
          if (cell.includes(separator) || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        lines.push(escapedRow.join(separator));
      });

      outputText = lines.join('\n');
      break;
    }
  }

  return {
    formattedString: outputText,
    rowsCount: processedRows.length
  };
}
