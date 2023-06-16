import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { useContainer } from 'class-validator';
import { DatabaseService, ObjectId, toPOJO } from '@wandu-ar/nestjs-schemas';
import { dummyStub, updateDummyStub } from '../stubs';
import { dummyMock } from '../mocks';
import { AppModule } from '../../../../app.module';

describe('DummiesController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;
  const baseStub = dummyStub();
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
      const entityObj = toPOJO(baseStub);

      // external check
      const response = await request(httpServer)
        .post('/dummies')
        .send(entityObj)
        .set('Authorization', token);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(entityObj);

      // internal check
      const document = await dbConnection.collection('dummies').findOne({
        _id: new ObjectId(response.body._id),
      });
      expect(document).toMatchObject(baseStub);
    });

    it("shouldn't create a dummy document", async () => {
      const mockEntityObj = toPOJO(dummyMock());

      // external check
      const response = await request(httpServer)
        .post('/dummies')
        .send(mockEntityObj)
        .set('Authorization', token);
      expect(response.status).toBe(400);
    });
  });

  describe('findAll', () => {
    it('should return an array of dummies documents', async () => {
      await dbConnection.collection('dummies').insertOne({ ...baseStub, deleted: false });

      // external check
      const response = await request(httpServer).get('/dummies').set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject([toPOJO(baseStub)]);
    });
  });

  describe('findById', () => {
    it('should return a dummy document', async () => {
      const document = await dbConnection
        .collection('dummies')
        .insertOne({ ...baseStub, deleted: false });
      const id = document.insertedId.toString();

      // external check
      const response = await request(httpServer)
        .get('/dummies/' + id)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(toPOJO(baseStub));
    });
  });

  describe('update', () => {
    it('should update a dummy document', async () => {
      const entityObj = toPOJO(baseStub);
      const updatedEntityObj = toPOJO(updateDummyStub());
      const document = await dbConnection
        .collection('dummies')
        .insertOne({ ...baseStub, deleted: false });
      const id = document.insertedId.toString();

      // check
      const response = await request(httpServer)
        .put('/dummies/' + id)
        .send(updatedEntityObj)
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ...entityObj,
        ...updatedEntityObj,
      });
    });
  });

  describe('delete', () => {
    it('should delete a dummy document', async () => {
      const document = await dbConnection
        .collection('dummies')
        .insertOne({ ...baseStub, deleted: false });
      const id = document.insertedId;

      // external check
      const response = await request(httpServer)
        .delete('/dummies/' + id)
        .set('Authorization', token);
      expect(response.status).toBe(204);

      // internal check
      let result = await dbConnection.collection('dummies').findOne({
        _id: id,
      });
      if (result?.deleted) result = null;
      expect(result).toBeNull();
    });
  });
});
