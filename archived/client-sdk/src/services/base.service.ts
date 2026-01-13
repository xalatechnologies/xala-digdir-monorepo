/**
 * Base Service
 * Open/Closed: Base class that can be extended for domain services
 * Liskov Substitution: All services can be used interchangeably
 */

import type { IHttpClient } from '../core/http-client.interface';
import { getClient } from '../core/client-factory';

export abstract class BaseService {
  protected readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  protected get client(): IHttpClient {
    return getClient();
  }

  protected buildPath(path: string = ''): string {
    return `${this.basePath}${path}`;
  }
}
