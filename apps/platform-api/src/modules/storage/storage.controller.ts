/**
 * Storage Controller
 * API endpoints for file upload, download, and management
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, Post, Get, Delete, Patch } from '../../core/decorators';
import { StorageService } from './storage.service';
import {
  UploadFileRequestSchema,
  type UploadFileResponse,
  type UploadMultipleFilesResponse,
  ListFilesQuerySchema,
  type ListFilesResponse,
  UpdateFileMetadataRequestSchema,
} from './storage.dto';

@Controller('/api/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Upload a single file
   * POST /api/storage/upload
   */
  @Post('/upload')
  async uploadFile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<UploadFileResponse> {
    const tenantId = (request as any).tenantId;
    if (!tenantId) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Tenant ID required',
      });
    }

    try {
      // Get multipart file data
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({
          type: 'https://digilist.no/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'No file provided',
        });
      }

      const buffer = await data.toBuffer();
      const fields = data.fields as any;

      // Validate metadata
      const metadata = UploadFileRequestSchema.parse({
        tenantId,
        category: fields.category?.value || 'rental-object-image',
        entityType: fields.entityType?.value,
        entityId: fields.entityId?.value,
        altText: fields.altText?.value,
        caption: fields.caption?.value,
      });

      // Upload file
      const result = await this.storageService.uploadFile({
        tenantId: metadata.tenantId,
        category: metadata.category as any,
        filename: data.filename,
        buffer,
        mimetype: data.mimetype,
      });

      // TODO: Save file metadata to database
      // const fileRecord = await this.fileRepository.create({
      //   ...result,
      //   entityType: metadata.entityType,
      //   entityId: metadata.entityId,
      //   altText: metadata.altText,
      //   caption: metadata.caption,
      // });

      return reply.code(201).send({
        id: result.id,
        url: result.url,
        filename: data.filename,
        originalFilename: data.filename,
        mimetype: data.mimetype,
        sizeBytes: result.size,
        category: metadata.category,
        entityType: metadata.entityType,
        entityId: metadata.entityId,
        altText: metadata.altText,
        caption: metadata.caption,
        createdAt: result.createdAt.toISOString(),
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          type: 'https://digilist.no/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: error.message,
        });
      }
      
      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Upload multiple files
   * POST /api/storage/upload-multiple
   */
  @Post('/upload-multiple')
  async uploadMultipleFiles(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<UploadMultipleFilesResponse> {
    const tenantId = (request as any).tenantId;
    if (!tenantId) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Tenant ID required',
      });
    }

    try {
      const parts = request.parts();
      const uploadedFiles: UploadFileResponse[] = [];
      const errors: Array<{ filename: string; error: string }> = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          try {
            const buffer = await part.toBuffer();
            const result = await this.storageService.uploadFile({
              tenantId,
              category: 'rental-object-image',
              filename: part.filename,
              buffer,
              mimetype: part.mimetype,
            });

            uploadedFiles.push({
              id: result.id,
              url: result.url,
              filename: part.filename,
              originalFilename: part.filename,
              mimetype: part.mimetype,
              sizeBytes: result.size,
              category: 'rental-object-image',
              createdAt: result.createdAt.toISOString(),
            });
          } catch (error: any) {
            errors.push({
              filename: part.filename,
              error: error.message,
            });
          }
        }
      }

      return reply.code(201).send({
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length,
        totalFailed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * List files
   * GET /api/storage/files
   */
  @Get('/files')
  async listFiles(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<ListFilesResponse> {
    const tenantId = (request as any).tenantId;
    
    try {
      const query = ListFilesQuerySchema.parse(request.query);
      
      // TODO: Fetch from database
      // const files = await this.fileRepository.list({
      //   tenantId: query.tenantId || tenantId,
      //   category: query.category,
      //   entityType: query.entityType,
      //   entityId: query.entityId,
      //   page: query.page,
      //   limit: query.limit,
      // });

      // Mock response for now
      return reply.send({
        data: [],
        meta: {
          total: 0,
          page: query.page,
          limit: query.limit,
          totalPages: 0,
        },
      });
    } catch (error: any) {
      return reply.code(400).send({
        type: 'https://digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Delete a file
   * DELETE /api/storage/files/:id
   */
  @Delete('/files/:id')
  async deleteFile(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const { id } = request.params;

    try {
      // TODO: Get file metadata from database
      // const file = await this.fileRepository.findById(id, tenantId);
      // if (!file) {
      //   return reply.code(404).send({ error: 'File not found' });
      // }

      // TODO: Delete file from storage
      // await this.storageService.deleteFile(tenantId, file.category, file.filename);
      
      // TODO: Delete from database
      // await this.fileRepository.delete(id, tenantId);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Update file metadata
   * PATCH /api/storage/files/:id
   */
  @Patch('/files/:id')
  async updateFileMetadata(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<UploadFileResponse> {
    const tenantId = (request as any).tenantId;
    const { id } = request.params;

    try {
      const updates = UpdateFileMetadataRequestSchema.parse(request.body);

      // TODO: Update in database
      // const file = await this.fileRepository.update(id, tenantId, updates);
      
      // Mock response
      return reply.send({
        id,
        url: '/storage/mock.png',
        filename: 'mock.png',
        originalFilename: 'mock.png',
        mimetype: 'image/png',
        sizeBytes: 1000,
        category: 'rental-object-image',
        altText: updates.altText,
        caption: updates.caption,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(400).send({
        type: 'https://digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: error.message,
      });
    }
  }
}
