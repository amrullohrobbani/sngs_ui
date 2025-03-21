"use server"

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Define the structure of your data
export interface DataRow {
  OriginalFrame: number;
  Frame: number;
  x:number;
  y:number;
  [key: string]: unknown;
}

// Server action that reads CSV files, processes data, and returns the result
export const processCSVFiles = async (folderPathInput: string) => {
  const folderPath = path.join(process.cwd(), 'public/action-spotting/' ,folderPathInput); // Adjust path if necessary
  // Recursively get CSV files
  const getCSVFiles = async (dir: string): Promise<string[]> => {
    let files: string[] = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(await getCSVFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.csv')) {
        files.push(fullPath);
      }
    }
    return files;
  };

  // Read and parse CSV files
  const readCSV = async (filePath: string): Promise<DataRow[]> => {
    return new Promise((resolve, reject) => {
      const results: DataRow[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Convert to numbers
          data.OriginalFrame = (Number(filePath.split('_').pop()?.split('.')[0])*1000) + Number(data.OriginalFrame);
          data.Frame = (Number(filePath.split('_').pop()?.split('.')[0])*1000) + Number(data.Frame);
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  };

  try {
    // Get CSV files
    const csvFiles = await getCSVFiles(folderPath);

    // Read and combine data from all CSV files
    let combinedData: DataRow[] = [];
    for (const file of csvFiles) {
      const data = await readCSV(file);
      combinedData = combinedData.concat(data);
    }

    // Calculate FrameDifference
    const processedData = combinedData.map((row) => ({
      ...row,
      FrameDifference: row.OriginalFrame - row.Frame,
    }));

    return processedData;
  } catch (error) {
    console.error('Error processing CSV files:', error);
  }
};