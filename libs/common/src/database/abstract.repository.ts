import { Logger } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import {
  ClientSession,
  Connection,
  FilterQuery,
  Model,
  SaveOptions,
  SortOrder,
  Types,
  UpdateQuery,
} from 'mongoose';
import { RpcException } from '@nestjs/microservices';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new RpcException({ error: 'Document not found.', code: 404 });
    }

    return document as TDocument;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn(
        `Document not found with filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      throw new RpcException({ error: 'Document not found.', code: 404 });
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.updateOne(filterQuery, document, {
      upsert: true,
      lean: true,
      new: true,
    });
  }

  async find(filterQuery?: FilterQuery<TDocument>) {
    const document = await this.model.find(filterQuery, {}, { lean: true });

    if (!document || document.length === 0) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new RpcException({ error: 'Document not found.', code: 404 });
    }

    return document;
  }

  async paginatedFind(
    limit: number,
    offset: number,
    filterQuery?: FilterQuery<TDocument>,
    sorting?: { [key: string]: SortOrder },
  ) {
    let document = [];
    if (!sorting) {
      document = await this.model
        .find(filterQuery, {}, { lean: true })
        .skip((offset - 1) * limit)
        .limit(limit);
    } else if (sorting) {
      document = await this.model
        .find(filterQuery, {}, { lean: true, sort: sorting })
        .skip((offset - 1) * limit)
        .limit(limit);
    }

    if (!document || document.length === 0) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new RpcException({ error: 'Document not found.', code: 404 });
    }

    return document;
  }

  async findOneAndDelete(filterQuery: FilterQuery<TDocument>) {
    return this.model.findOneAndDelete(filterQuery, {
      lean: true,
      new: true,
    });
  }

  async count(filterQuery: FilterQuery<TDocument>) {
    return this.model.countDocuments(filterQuery, { lean: true });
  }

  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
