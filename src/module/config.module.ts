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
  static load(options?: DotenvConfig): DynamicModule;
  static load(glob?: string, options?: DotenvConfig): DynamicModule;
  static load(
    globOrOptions?: string | DotenvConfig,
    options?: DotenvConfig,
  ): DynamicModule {
    const configProvider = {
      provide: ConfigService,
      useFactory: async (): Promise<ConfigService> => {
        return ConfigService.load(globOrOptions, options);
      },
    };
    return {
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}
