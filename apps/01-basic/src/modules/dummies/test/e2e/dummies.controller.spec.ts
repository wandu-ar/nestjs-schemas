import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { useContainer } from 'class-validator';
import { DatabaseService, PaginatedResponseDto, toPOJO } from '@wandu-ar/nestjs-schemas';
import { dummyStub, createDummyStub, updateDummyStub } from '../stubs';
import { AppModule } from '../../../../app.module';
import { DummyDto } from '../../dtos';
import { DUMMY_PK } from '../../schemas';
import { from } from 'uuid-mongodb';

describe('DummiesController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;
  //const baseStub = dummyStub();
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
    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getConnection();
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

      // external check
      const response = await request(httpServer)
        .post('/dummies')
        .send(entityObj)
        .set('Authorization', token);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(DUMMY_PK);
      expect(response.body).toEqual(expect.objectContaining(entityObj));
      const id = response.body[DUMMY_PK] ?? null;

      // internal check
      // TODO: Implementar con ObjectId
      const document = await dbConnection.collection('dummies').findOne({
        [DUMMY_PK]: from(id),
      });
      expect(document).toEqual(expect.objectContaining(entityObj));
      expect(document).toHaveProperty(DUMMY_PK);
      const dbId = (from(document?.[DUMMY_PK]) ?? null).toString();
      expect(dbId).toEqual(id);
    });
  });

  describe('findAll', () => {
    it('should return an array of dummies documents', async () => {
      const stub = dummyStub();
      await dbConnection.collection('dummies').insertOne({ ...stub, deleted: false });

      // external check
      const response = await request(httpServer).get('/dummies').set('Authorization', token);
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
      const id = (from(document?.[DUMMY_PK]) ?? null).toString();

      // external check
      const response = await request(httpServer)
        .get('/dummies/' + id)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(toPOJO(stub));
    });
  });

  describe('update', () => {
    it('should update a dummy document', async () => {
      const stub = dummyStub();
      const updatedEntityObj = toPOJO(updateDummyStub());
      const result = await dbConnection
        .collection('dummies')
        .insertOne({ ...stub, deleted: false });
      const _id = result.insertedId;
      const document = await dbConnection.collection('dummies').findOne({ _id });
      const id = (from(document?.[DUMMY_PK]) ?? null).toString();

      // check
      const response = await request(httpServer)
        .put('/dummies/' + id)
        .send(updatedEntityObj)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updatedEntityObj));
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
      const id = (from(document?.[DUMMY_PK]) ?? null).toString();

      // external check
      const response = await request(httpServer)
        .delete('/dummies/' + id)
        .set('Authorization', token);
      expect(response.status).toBe(204);

      // internal check
      let result2 = await dbConnection.collection('dummies').findOne({ [DUMMY_PK]: id });
      if (result2?.deleted) result2 = null;
      expect(result2).toBeNull();
    });
  });
});
