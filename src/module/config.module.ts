import 'reflect-metadata';
import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigService, DotenvConfig } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  static resolveSrcPath(startPath: string): typeof ConfigModule {
    ConfigService.resolveSrcPath(startPath);
    return this;
  }

  /**
   * From Glob
   * @param glob
   * @param {DotenvConfigOptions} options
   * @returns {DynamicModule}
   */
  static load(glob?: string, options?: DotenvConfig): DynamicModule {
    const configProvider = {
      provide: ConfigService,
      useFactory: async (): Promise<ConfigService> => {
        return ConfigService.load(glob, options);
      },
    };
    return {
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}
