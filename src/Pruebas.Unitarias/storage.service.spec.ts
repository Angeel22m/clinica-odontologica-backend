import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../firebase/storage.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ExpedienteArchivoService } from '../firebase/expediente-archivo.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

// Mock uuid
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('uuid-test') }));

describe('StorageService', () => {
  let service: StorageService;
  let firebaseService: any;
  let expedienteArchivoService: any;

  // Mock consistente del objeto File del bucket
  const fakeBucketFile = {
    createWriteStream: jest.fn(),
    getSignedUrl: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  };

  const fakeBucket = {
    file: jest.fn().mockReturnValue(fakeBucketFile),
  };

  const fakeFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('file content'),
  };

  beforeEach(async () => {
    // Limpiar mocks
    jest.clearAllMocks();

    // Mock Servicios
    firebaseService = { getBucket: jest.fn().mockReturnValue(fakeBucket) };
    expedienteArchivoService = {
      validateFks: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: FirebaseService, useValue: firebaseService },
        { provide: ExpedienteArchivoService, useValue: expedienteArchivoService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // uploadFile
  // =========================================================
  describe('uploadFile', () => {
    it('should upload file and return metadata', async () => {
      // Simular stream de Firebase
      const blobStream = {
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
          return blobStream;
        }),
        end: jest.fn(),
      };

      fakeBucketFile.createWriteStream.mockReturnValue(blobStream);
      fakeBucketFile.getSignedUrl.mockResolvedValue(['http://signed-url']);
      expedienteArchivoService.create.mockResolvedValue({ id: 123 });

      const result = await service.uploadFile(fakeFile as any, 1, 1);

      expect(expedienteArchivoService.validateFks).toHaveBeenCalledWith(1, 1);
      expect(blobStream.end).toHaveBeenCalledWith(fakeFile.buffer);

      expect(result).toEqual({
        storageName: 'uuid-test.pdf',
        filePath: 'archivos/uuid-test.pdf',
        signedUrl: 'http://signed-url',
        dbId: 123,
      });
    });

    it('should throw BadRequestException for invalid mimetype', async () => {
      const invalidFile = { ...fakeFile, mimetype: 'text/plain' };

      await expect(service.uploadFile(invalidFile as any, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject InternalServerErrorException on stream error', async () => {
      const blobStream = {
        on: jest.fn((event, cb) => {
          if (event === 'error') cb(new Error('upload failed'));
          return blobStream;
        }),
        end: jest.fn(),
      };

      fakeBucketFile.createWriteStream.mockReturnValue(blobStream);

      await expect(
        service.uploadFile(fakeFile as any, 1, 1),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // =========================================================
  // generateSignedUrls
  // =========================================================
  describe('generateSignedUrls', () => {
    it('should return signed urls for existing files', async () => {
      fakeBucketFile.exists.mockResolvedValue([true]);
      fakeBucketFile.getSignedUrl.mockResolvedValue(['http://url']);

      fakeBucket.file.mockReturnValue(fakeBucketFile);

      const urls = await service.generateSignedUrls(['archivos/test.pdf']);

      expect(urls).toEqual(['http://url']);
    });

    it('should skip non-existing files', async () => {
      fakeBucketFile.exists.mockResolvedValue([false]);
      fakeBucket.file.mockReturnValue(fakeBucketFile);

      const urls = await service.generateSignedUrls(['archivos/missing.pdf']);

      expect(urls).toEqual([]);
    });
  });

  // =========================================================
  // deleteFile
  // =========================================================
  describe('deleteFile', () => {
    it('should delete file and DB record', async () => {
      expedienteArchivoService.findOne.mockResolvedValue({
        filePath: 'archivos/test.pdf',
        id: 1,
      });

      fakeBucketFile.delete.mockResolvedValue(undefined);
      fakeBucket.file.mockReturnValue(fakeBucketFile);
      expedienteArchivoService.delete.mockResolvedValue(undefined);

      const result = await service.deleteFile(1);

      expect(expedienteArchivoService.findOne).toHaveBeenCalledWith(1);
      expect(fakeBucketFile.delete).toHaveBeenCalled();
      expect(expedienteArchivoService.delete).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        success: true,
        message: 'Archivo y registro 1 eliminados.',
      });
    });
  });
});
