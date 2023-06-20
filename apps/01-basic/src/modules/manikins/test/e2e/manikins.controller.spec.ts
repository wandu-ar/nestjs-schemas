import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { useContainer } from 'class-validator';
import { PaginatedResponseDto, castToUUIDv4Fn, toPOJO } from '@wandu-ar/nestjs-schemas';
import { manikinStub, createManikinStub, updateManikinStub } from '../stubs';
import { AppModule } from '../../../../app.module';
import { ManikinDto } from '../../dtos';
import { MANIKIN_PK } from '../../schemas';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../../../../database';

describe('ManikinsController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;
  //const baseStub = manikinStub();
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
        excludePrefixes: ['__'],
      }),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
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
    await dbConnection.collection('manikins').deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await dbConnection.collection('manikins').deleteMany({});
  });

  describe('create', () => {
    it('should create a manikin document', async () => {
      const entityObj = createManikinStub();

      // external check
      const response = await request(httpServer)
        .post('/manikins')
        .send(entityObj)
        .set('Authorization', token);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(MANIKIN_PK);
      const doc = plainToInstance(ManikinDto, response.body);
      expect(doc).toEqual(expect.objectContaining(entityObj));
      const id = response.body[MANIKIN_PK] ?? null;

      // internal check
      const document = await dbConnection.collection('manikins').findOne({
        [MANIKIN_PK]: castToUUIDv4Fn(id),
      });
      expect(document).toEqual(expect.objectContaining(entityObj));
      expect(document).toHaveProperty(MANIKIN_PK);
      const dbId = castToUUIDv4Fn(document?.[MANIKIN_PK] ?? null).toString();
      expect(dbId).toEqual(id);
    });
  });

  describe('findAll', () => {
    it('should return an array of manikins documents', async () => {
      const stub = manikinStub();
      await dbConnection.collection('manikins').insertOne({ ...stub, deleted: false });

      // external check
      const response = await request(httpServer).get('/manikins').set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject<PaginatedResponseDto<ManikinDto>>({
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
    it('should return a manikin document', async () => {
      const stub = manikinStub();
      const result = await dbConnection
        .collection('manikins')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('manikins').findOne({ _id });
      const id = (castToUUIDv4Fn(document?.[MANIKIN_PK]) ?? null).toString();

      // external check
      const response = await request(httpServer)
        .get('/manikins/' + id)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(toPOJO(stub));
    });
  });

  describe('update', () => {
    it('should update a manikin document', async () => {
      const stub = manikinStub();
      const result = await dbConnection
        .collection('manikins')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('manikins').findOne({ _id });
      const id = (castToUUIDv4Fn(document?.[MANIKIN_PK]) ?? null).toString();
      //
      const entityObj = updateManikinStub();

      // check
      const response = await request(httpServer)
        .put('/manikins/' + id)
        .send(entityObj)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      const doc = plainToInstance(ManikinDto, response.body);
      expect(doc).toEqual(expect.objectContaining(entityObj));
    });
  });

  describe('delete', () => {
    it('should delete a manikin document', async () => {
      const stub = manikinStub();
      const result = await dbConnection
        .collection('manikins')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('manikins').findOne({ _id });
      const id = (castToUUIDv4Fn(document?.[MANIKIN_PK]) ?? null).toString();

      // external check
      const response = await request(httpServer)
        .delete('/manikins/' + id)
        .set('Authorization', token);
      expect(response.status).toBe(204);

      // internal check
      let result2 = await dbConnection.collection('manikins').findOne({ [MANIKIN_PK]: id });
      if (result2?.deleted) result2 = null;
      expect(result2).toBeNull();
    });
  });
});
