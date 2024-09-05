import { CacheModuleOptions } from '@nestjs/common';

import { redisStore } from 'cache-manager-redis-yet';

import { CacheStorageType } from 'src/engine/integrations/cache-storage/types/cache-storage-type.enum';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export const cacheStorageModuleFactory = (
  environmentService: EnvironmentService,
): CacheModuleOptions => {
  const cacheStorageType = environmentService.get('CACHE_STORAGE_TYPE');
  const cacheStorageTtl = environmentService.get('CACHE_STORAGE_TTL');
  const cacheModuleOptions: CacheModuleOptions = {
    isGlobal: true,
    ttl: cacheStorageTtl * 1000,
  };

  switch (cacheStorageType) {
    case CacheStorageType.Memory: {
      return cacheModuleOptions;
    }
    case CacheStorageType.Redis: {
      const host = environmentService.get('REDIS_HOST');
      const port = environmentService.get('REDIS_PORT');

      if (!(host && port)) {
        throw new Error(
          `${cacheStorageType} cache storage requires host: ${host} and port: ${port} to be defined, check your .env file`,
        );
      }

      const username = environmentService.get('REDIS_USERNAME');
      const password = environmentService.get('REDIS_PASSWORD');

      return {
        ...cacheModuleOptions,
        store: redisStore,
        socket: {
          host,
          port,
          username,
          password,
        },
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${cacheStorageType}), check your .env file`,
      );
  }
};
