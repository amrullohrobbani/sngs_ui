"use server"

import fs from 'fs'
import path from 'path'

const getDirectoryTree = (dir: string): unknown[] => {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const tree: unknown[] = [];

  items.forEach((item) => {
    if (item.isDirectory()) {
      const dirPath = path.join(dir, item.name);
      const subTree = getDirectoryTree(dirPath); // Recursively get subdirectory tree

      // Only add the directory if it has subdirectories or files inside
      if (subTree.length > 0 || fs.readdirSync(dirPath, { withFileTypes: true }).some(i => i.isDirectory())) {
        tree.push([item.name, ...subTree]);
      }
    }
  });

  return tree;
};


export async function getFolders(type:string = 'data') {
  const targetFolder = path.join(process.cwd(), `public/${type !== "/"? type: "data"}`);
  const items = fs.readdirSync(targetFolder);
  const folders = items.filter(item => fs.lstatSync(path.join(targetFolder, item)).isDirectory());
  return folders
}

export const getDataDirectories = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'data');
  try {
    const directories = getDirectoryTree(dataPath);
    return directories;
  } catch (error) {
    console.error('Error reading directories:', error);
    return [];
  }
};