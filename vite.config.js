import { defineConfig } from 'vite';
import { resolve, join, parse } from 'path';
import { readdirSync, statSync } from 'fs';

function getAllHtmlFiles(dirPath, arrayOfFiles) {
  const files = readdirSync(dirPath);
  
  arrayOfFiles = arrayOfFiles || [];
  
  files.forEach(function(file) {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.html')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  
  return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(__dirname);
const inputFiles = {};

htmlFiles.forEach((file) => {
  let relativePath = file.replace(__dirname, '').replace(/^\\|^\//, '');
  const key = relativePath.replace(/\.html$/, '').replace(/\\/g, '/');
  inputFiles[key] = resolve(__dirname, file);
});

export default defineConfig({
  build: {
    rollupOptions: {
      input: inputFiles
    }
  }
});
