import { ModulesContainer, NestApplication, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { useContainer } from 'class-validator';
import {
  PaginatedResponseDto,
  castToUUIDv4Fn,
  defaultTransformOptions,
  toPOJO,
} from '@wandu-ar/nestjs-schemas';
import { dummyStub, createDummyStub, updateDummyStub } from '../stubs';
import { AppModule } from '../../../../../../app.module';
import { DummyDto } from '../../dtos';
import { DUMMY_PK } from '../../schemas';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../../../../../../database';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DummiesModule } from '../../dummies.module';

describe('DummiesController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: NestApplication;
  let basePath = '';
  const token = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Global interceptors
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector), {
        excludePrefixes: ['_', '__'],
      }),
    );

    // Get basepath of module
    const modulesContainer = moduleRef.get(ModulesContainer);
    basePath = Reflect.getMetadata(MODULE_PATH + modulesContainer.applicationId, DummiesModule);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { ...defaultTransformOptions },
        whitelist: true,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );
    await app.init();
    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDefault();
    httpServer = app.getHttpServer();

    // Obtener fake access token
    // TODO: Obtener por config service lo necesario
    // const response = await request(httpServer).get('/auth/test-token');
    // token = 'Bearer ' + response.body.accessToken;
  });

  afterAll(async () => {
    await dbConnection.collection('dummies').deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await dbConnection.collection('dummies').deleteMany({});
  });

  describe('create', () => {
    it('should create a dummy document', async () => {
      const entityObj = createDummyStub();
      const entityPOJO = toPOJO(entityObj);

      // external check
      const response = await request(httpServer)
        .post(basePath)
        .send(entityPOJO)
        .set('Authorization', token);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(DUMMY_PK);
      const body = plainToInstance(DummyDto, response.body, defaultTransformOptions);
      expect(toPOJO(body)).toEqual(expect.objectContaining(entityPOJO));
      const id = response.body[DUMMY_PK] ?? null;

      // internal check
      const document = await dbConnection.collection('dummies').findOne({
        [DUMMY_PK]: castToUUIDv4Fn(id),
      });
      expect(toPOJO(document)).toEqual(expect.objectContaining(entityPOJO));
      expect(document).toHaveProperty(DUMMY_PK);
      const dbId = castToUUIDv4Fn(document?.[DUMMY_PK] ?? null).toString();
      expect(dbId).toEqual(id);
    });
  });

  describe('findAll', () => {
    it('should return an array of dummies documents', async () => {
      const stub = dummyStub();
      await dbConnection.collection('dummies').insertOne({ ...stub, deleted: false });

      // external check
      const response = await request(httpServer).get(basePath).set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject<PaginatedResponseDto<DummyDto>>({
        filtered: 1,
        limit: 10,
        offset: 0,
        showing: 1,
        total: 1,
        data: [toPOJO(stub)],
      }); //
    });
  });

  describe('findById', () => {
    it('should return a dummy document', async () => {
      const stub = dummyStub();
      const result = await dbConnection
        .collection('dummies')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('dummies').findOne({ _id });
      const id = (castToUUIDv4Fn(document?.[DUMMY_PK]) ?? null).toString();

      // external check
      const response = await request(httpServer)
        .get(`${basePath}/${id}`)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(toPOJO(stub));
    });
  });

  describe('update', () => {
    it('should update a dummy document', async () => {
      const stub = dummyStub();
      const result = await dbConnection
        .collection('dummies')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('dummies').findOne({ _id });
      const id = (castToUUIDv4Fn(document?.[DUMMY_PK]) ?? null).toString();
      //
      const entityObj = updateDummyStub();
      const entityPOJO = toPOJO(entityObj);

      // check
      const response = await request(httpServer)
        .put(`${basePath}/${id}`)
        .send(entityPOJO)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      const body = plainToInstance(DummyDto, response.body, defaultTransformOptions);
      expect(toPOJO(body)).toEqual(expect.objectContaining(entityPOJO));
    });
  });

  describe('delete', () => {
    it('should delete a dummy document', async () => {
      const stub = dummyStub();
      const result = await dbConnection
        .collection('dummies')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('dummies').findOne({ _id });
      const id = (castToUUIDv4Fn(document?.[DUMMY_PK]) ?? null).toString();

      // external check
      const response = await request(httpServer)
        .delete(`${basePath}/${id}`)
        .set('Authorization', token);
      expect(response.status).toBe(204);

      // internal check
      let result2 = await dbConnection.collection('dummies').findOne({ [DUMMY_PK]: id });
      if (result2?.deleted) result2 = null;
      expect(result2).toBeNull();
    });
  });
});
