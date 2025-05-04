import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { translateFile } from '../services/translator.js';
import upload from '../middleware/upload.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// API upload file và dịch
router.post('/upload', upload.single('file'), async (req, res) => {
  console.group(chalk.blue(`Processing upload for file: ${req.file?.originalname}`));
  try {
    if (!req.file) {
      console.log(chalk.yellow('No file uploaded'));
      console.groupEnd();
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId || 'default_user';
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const outputFileName = `translated-${req.file.filename}`;
    const outputPath = path.join(__dirname, '../../translated', outputFileName);

    // Ước lượng thời gian dịch (1 giây cho mỗi 10KB, tối thiểu 1 giây)
    const fileSize = req.file.size / 1024; // Kích thước file (KB)
    const estimatedTime = Math.max(1, Math.ceil(fileSize / 10)); // Giây

    // Log user action
    const logMessage = `${new Date().toISOString()} - User ${userId} uploaded file ${req.file.originalname} via /api/files/upload, estimated time: ${estimatedTime}s\n`;
    await fs.appendFile(path.join(__dirname, '../../logs/user-actions.log'), logMessage);
    console.log(chalk.cyan(`User action: File upload by ${userId}, file: ${req.file.originalname}, estimated time: ${estimatedTime}s`));

    fs.ensureDirSync(path.join(__dirname, '../../translated'));

    console.log(chalk.blue(`Starting translation for file: ${req.file.originalname}`));
    const translatedContent = await translateFile(filePath, fileExtension, userId, (completed, total) => {
      console.log(chalk.yellow(`Translation progress: ${completed}/${total}`));
    });

    await fs.writeFile(outputPath, translatedContent);
    console.log(chalk.green(`Translated file saved: ${outputFileName}`));

    const downloadUrl = `/translated/${outputFileName}`;
    res.json({ message: 'File translated successfully', downloadUrl, translatedContent, estimatedTime });
  } catch (error) {
    console.error(chalk.red('Error processing file:', error.message));
    res.status(500).json({ error: 'Error processing file', details: error.message });
  }
  console.groupEnd();
});

// API translate
router.post('/translate', upload.single('file'), async (req, res) => {
  console.group(chalk.blue(`Processing translation for file: ${req.file?.originalname}`));
  try {
    if (!req.file) {
      console.log(chalk.yellow('No file uploaded'));
      console.groupEnd();
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId || 'default_user';
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const outputFileName = `translated-${req.file.filename}`;
    const outputPath = path.join(__dirname, '../../translated', outputFileName);

    // Ước lượng thời gian dịch (1 giây cho mỗi 10KB, tối thiểu 1 giây)
    const fileSize = req.file.size / 1024; // Kích thước file (KB)
    const estimatedTime = Math.max(1, Math.ceil(fileSize / 10)); // Giây

    // Log user action
    const logMessage = `${new Date().toISOString()} - User ${userId} translated file ${req.file.originalname} via /api/files/translate, estimated time: ${estimatedTime}s\n`;
    await fs.appendFile(path.join(__dirname, '../../logs/user-actions.log'), logMessage);
    console.log(chalk.cyan(`User action: File translation by ${userId}, file: ${req.file.originalname}, estimated time: ${estimatedTime}s`));

    fs.ensureDirSync(path.join(__dirname, '../../translated'));

    console.log(chalk.blue(`Starting translation for file: ${req.file.originalname}`));
    const translatedContent = await translateFile(filePath, fileExtension, userId, (completed, total) => {
      console.log(chalk.yellow(`Translation progress: ${completed}/${total}`));
    });

    await fs.writeFile(outputPath, translatedContent);
    console.log(chalk.green(`Translated file saved: ${outputFileName}`));

    const downloadUrl = `/translated/${outputFileName}`;
    res.json({ message: 'File translated successfully', downloadUrl, translatedContent, estimatedTime });
  } catch (error) {
    console.error(chalk.red('Error translating file:', error.message));
    res.status(500).json({ error: 'Error translating file', details: error.message });
  }
  console.groupEnd();
});

export default router;