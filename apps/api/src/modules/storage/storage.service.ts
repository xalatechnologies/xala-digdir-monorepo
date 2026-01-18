/**
 * Storage Service
 * Handles file uploads and management for rental object images
 * Follows API Backend Expert patterns with multi-tenant isolation
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadFileOptions {
  tenantId: string;
  category: 'rental-objects' | 'users' | 'organizations' | 'seed-images';
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

export interface StoredFile {
  id: string;
  url: string;
  path: string;
  size: number;
  mimetype: string;
  category: string;
  tenantId: string;
  createdAt: Date;
}

export class StorageService {
  private readonly baseDir: string;
  private readonly baseUrl: string;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  constructor() {
    // Storage directory: /var/www/digilist-storage/uploads or STORAGE_PATH env var
    this.baseDir = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    // Base URL for serving files
    this.baseUrl = process.env.STORAGE_BASE_URL || '/storage';
  }

  /**
   * Upload a file to storage
   * Creates directory structure: 
   * - For tenant uploads: storage/{tenantId}/{category}/{filename}
   * - For seed images: storage/seed-images/{category}/{filename}
   */
  async uploadFile(options: UploadFileOptions): Promise<StoredFile> {
    const { tenantId, category, filename, buffer, mimetype } = options;

    // Validate file size
    if (buffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate mimetype
    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new Error(`File type ${mimetype} not allowed`);
    }

    // Generate unique filename with hash to prevent overwriting
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const hash = crypto.randomBytes(4).toString('hex');
    const uniqueFilename = `${basename}-${hash}${ext}`;

    // Create directory structure based on category
    let categoryDir: string;
    let url: string;
    
    if (category === 'seed-images') {
      // Seed images go directly in seed-images folder
      categoryDir = path.join(this.baseDir, 'seed-images');
      url = `${this.baseUrl}/seed-images/${uniqueFilename}`;
    } else {
      // Tenant-specific uploads
      categoryDir = path.join(this.baseDir, tenantId, category);
      url = `${this.baseUrl}/${tenantId}/${category}/${uniqueFilename}`;
    }
    
    await fs.mkdir(categoryDir, { recursive: true });

    // Write file
    const filePath = path.join(categoryDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    return {
      id: hash,
      url,
      path: filePath,
      size: buffer.length,
      mimetype,
      category,
      tenantId,
      createdAt: new Date(),
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(tenantId: string, category: string, filename: string): Promise<void> {
    const filePath = path.join(this.baseDir, tenantId, category, filename);
    
    // Verify file exists and belongs to tenant (security check)
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(tenantId: string, category: string, filename: string): Promise<StoredFile | null> {
    const filePath = path.join(this.baseDir, tenantId, category, filename);
    
    try {
      const stats = await fs.stat(filePath);
      const url = `${this.baseUrl}/${tenantId}/${category}/${filename}`;

      return {
        id: filename,
        url,
        path: filePath,
        size: stats.size,
        mimetype: this.getMimetypeFromExtension(filename),
        category,
        tenantId,
        createdAt: stats.birthtime,
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List files in a category for a tenant
   */
  async listFiles(tenantId: string, category: string): Promise<StoredFile[]> {
    const categoryDir = path.join(this.baseDir, tenantId, category);
    
    try {
      const files = await fs.readdir(categoryDir);
      const fileInfos = await Promise.all(
        files.map(filename => this.getFileInfo(tenantId, category, filename))
      );
      return fileInfos.filter((info): info is StoredFile => info !== null);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get mimetype from file extension
   */
  private getMimetypeFromExtension(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimetypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    return mimetypes[ext] || 'application/octet-stream';
  }

  /**
   * Initialize storage directories
   * Called on app startup
   */
  async initialize(): Promise<void> {
    // Create base storage directory
    await fs.mkdir(this.baseDir, { recursive: true });
    
    // Create seed-images directory for static assets
    const seedImagesDir = path.join(this.baseDir, 'seed-images');
    await fs.mkdir(seedImagesDir, { recursive: true });
    
    // Create subdirectories matching actual seed structure
    const categories = [
      'Bibliotek',
      'lokaler-og-baner',
      'møterom',
      'Møterom og kursrom',
      'Selskapslokaler',
      'Svømmehall',
      'utstyr',
      'arrangement'
    ];
    for (const category of categories) {
      await fs.mkdir(path.join(seedImagesDir, category), { recursive: true });
    }

    console.log(`✓ Storage initialized at: ${this.baseDir}`);
    console.log(`✓ Seed images directory: ${seedImagesDir}`);
  }
}
