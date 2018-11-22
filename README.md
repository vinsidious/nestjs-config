<p align="center"><img src="https://avatars1.githubusercontent.com/u/41109786?s=200&v=4"/></p>
<p align="center">
    <a href="https://travis-ci.org/nestjs-community/nestjs-config"><img src="https://travis-ci.org/nestjs-community/nestjs-config.svg?branch=master"/></a>
    <a href="https://www.npmjs.com/package/nestjs-config"><img src="https://img.shields.io/npm/v/nestjs-config.svg"/></a>
    <a href="https://github.com/nestjs-community/nestjs-config/blob/master/LICENSE"><img src="https://img.shields.io/github/license/nestjs-community/nestjs-config.svg"/></a>
    <a href="https://coveralls.io/github/nestjs-community/nestjs-config?branch=master"><img src="https://coveralls.io/repos/github/nestjs-community/nestjs-config/badge.svg?branch=master"/></a>
</p>
<h1 align="center">Nestjs Config</h1>

<p align="center">Configuration component for NestJs.</p>


## Note

This is a fork of the original [`nestjs-config`](https://github.com/nestjs-community/nestjs-config) which has been modified to use [`dotenv-flow`](https://github.com/kerimdzhanov/dotenv-flow) instead of [`dotenv`](https://www.npmjs.com/package/dotenv).

## Features

- Load your configurations with globs
- Support for different environment configuration, thanks to [dotenv](https://github.com/motdotla/dotenv)
- Change and Load configuration at runtime

### Installation

**Yarn**
```bash
yarn add nestjs-config
```

**NPM**
```bash
npm install nestjs-config --save
```

### Getting Started

Let's imagine that we have a folder called `config` in our project under `src`

```bash
/src
├── app.module.ts
├── config
│   ├── express.ts
│   ├── graphql.ts
│   └── grpc.ts
```

Let's register the config module in `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from "nestjs-config";

@Module({
    imports: [
        ConfigModule.load(),
    ],
})
export class AppModule {}
```
That's it!

Now let's say that your application isn't in a folder called `src`, it's in `./app`.

```typescript
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from "nestjs-config";

@Module({
    imports: [
        ConfigModule.load(
            path.resolve(__dirname, 'config/**/*.{ts,js}')
        ),
    ],
})
export class AppModule {}
```

We provide as first argument the glob of our interested configuration that we want to load.

#### Complex project structure
For example project has the next structure:
```
/
├── dist/
├── src/
│   ├── app/
│   │   ├── app.module.ts
│   │   └── bootstrap/
│   │   │   ├── index.ts
│   │   │   └── bootstrap.module.ts
│   ├── migrations/
│   ├── cli/
│   ├── config/
│   │   ├── app.ts
│   │   └── database.ts
│   └── main.ts
├── tsconfig.json
└── package.json
```

On this example, config files are located near the app folder, because they are shared 
between app, migrations and cli scripts. 

Also during typescript compilation all files from `src/` folder will be moved to the `dist/` folder. 

Moreover `ConfigModule` is imported in `BootstrapModule`, but not directly in `AppModule`.

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { BootstrapModule } from "./bootstrap";

@Module({
    imports: [BootstrapModule],
})
export class AppModule {}
```

```typescript
// bootstrap.module.ts
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from "nestjs-config";

@Module({
    imports: [
      ConfigModule.load(path.resolve(__dirname, '../../config/**/*.{ts,js}')),
    ],
})
export class BootstrapModule {}
```
We still provide as first argument the glob of our configuration, but an example above looks a little bit ugly. 

Also we will always have to remember about this glob path when we want to move the `BootstrapModule` 
to different place.

There is two ways to avoid such situations:

- Explicitly set absolute path to the project sources from `AppModule` and use glob with relative path:
  ```typescript
  // app.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigService } from "nestjs-config";
  import * as path from "path";
  import { BootstrapModule } from "./bootstrap";
  
  ConfigService.srcPath = path.resolve(__dirname, '..');
  
  @Module({
      imports: [BootstrapModule],
  })
  export class AppModule {}
  ```
  
  ```typescript
  // bootstrap.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigModule } from "nestjs-config";
  
  @Module({
      imports: [
        ConfigModule.load('config/**/*.{ts,js}')
      ],
  })
  export class BootstrapModule {}
  ```

- Invoke `ConfigModule.resolveSrcPath(__dirname)` from any your module before config loading and use glob with relative path.
  ```typescript
  // bootstrap.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigModule } from "nestjs-config";
  
  @Module({
      imports: [
        ConfigModule.resolveSrcPath(__dirname).load('config/**/*.{ts,js}')
      ],
  })
  export class BootstrapModule {}
  ```

On these examples we provide as first argument the glob of our configuration, but it is relative to the `src/` folder.

### Environment configuration

This package ship with the amazing [dotenv](https://github.com/motdotla/dotenv) so that you can create
a `.env` file in your preferred location.

let's create one!

```bash
# .env

EXPRESS_PORT=3000
```

now in our `src/config/express.ts` file we can refer to that environment variable 

```ts
// src/config/express.ts


export default {

    port: process.env.EXPRESS_PORT
}
```

**Note:** By default the package look for a `.env` file in the path that you started your server from.
If you want to specify a path for your `.env` file use the second parameter of `ConfigModule.load`.


### Usage

Now we are ready to inject our `ConfigService` everywhere we'd like.

```ts
import {ConfigService} from 'nestjs-config'


@Injectable()
class SomeService {

    constructor(private readonly config: ConfigService) {
        this.config = config;
    }
    
    isProduction() {
        
        const env = this.config.get('app.environment');
        
        return env === 'production';
    }
}
```

You can also use the `@InjectConfig` decorator instead, as following:

```ts
import {InjectConfig} from 'nestjs-config';


@Injectable()
class SomeService {

    constructor(@InjectConfig() private readonly config) {
        this.config = config;
    }
}
```

### Customer Helpers
This feature allows you to create small helper function that computes values from configurations.

example `isProduction` helper:

```ts
// src/config/express.ts


export default {

    environment: process.env.EXPRESS_PORT
    port: process.env.EXPRESS_PORT,
    
    // helpers
    isProduction() {
        return this.get('express.environment') === 'production';
    }
}
```

usage:

```ts
this.config.get('express').isProduction();

// or

this.config._isProduction(); // note the underscore prefix.
```

**Global Helpers**

You can also attach helpers to the global instance as follow:

```ts

this.config.registerHelper('isProduction', () => {
    return this.get('express.environment') === 'production';
});
```

Then use it:

```ts
this.config.isProduction();
```

### ConfigService API

#### get(param: string | string[], value: any = undefined): any
Get a configuration value via path, you can use `dot notation` to traverse nested object.

```ts
this.config.get('server.port'); // 3000
```

#### set(param: string | string[], value: any = null): Config
Set a value at runtime, it creates one if doesn't exists.

```ts
this.config.set('server.port', 2000); // {server:{ port: 2000 }}
```

#### has(param: string | string[]): boolean
Determine if the given path for a configuration exists and set

```ts
this.config.has('server.port'); // true or false
```

#### merge(glob: string, options?: DotenvOptions): Promise<void>
You can load other configuration at runtime. Great for package development.

```ts
@Module({})
export class PackageModule implements NestModule {

    constructor(@InjectConfig() private readonly config) {}

    async configure(consumer: MiddlewareConsumer) {
        await this.config.merge(path.join(__dirname, '**/*.config.{ts,js}'));
    }
}
```

#### registerHelper(name: string, fn: (...args:any[]) => any): ConfigService
Register custom global helper

```ts
this.config.registerHelper('isProduction', () => {
    return this.get('express.environment') === 'production';
});
```

## Decorators 

It's possible to use decorators instead of injecting the ConfigService. 
But note that `@Configurable()` decorator replaces `descriptor.value` for the
method with own function. Regarding to the current nestjs implementation
([Issue-1180](https://github.com/nestjs/nest/issues/1180)) this behavior will 
break all decorators that follow after `Configurable()` decorator.

For the right behavior `@Configurable()` decorator **MUST** be placed at 
the last place when you use several decorators for one method.

**Working example:**
```typescript
import {Injectable, Get} from '@nestjs/common';
import {Configurable, ConfigParam} from 'nestjs-config';

@Injectable()
export default class UserController {
    
    @Get("/")
    @Configurable()
    index(@ConfigParam('my.parameter', 'deafult value') parameter?: string) {
        return { data: parameter };
    }
}
```
**Broken example:**
```typescript
import {Injectable, Get, UseInterceptors} from '@nestjs/common';
import {Configurable, ConfigParam} from 'nestjs-config';
import {TransformInterceptor} from '../interceptors';

@Injectable()
export default class UserController {
    
    @Configurable()
    @Get("/")   // <-- nestjs decorator won't work because it placed after @Configurable()
    @UseInterceptors(TransformInterceptor)// <-- nestjs decorator won't work because it placed after @Configurable()
    index(@ConfigParam('my.parameter', 'deafult value') parameter?: string) {
        return { data: parameter };
    }
}
```

**Broken example 2:**
```typescript
import {Injectable, Get, UseInterceptors} from '@nestjs/common';
import {Configurable, ConfigParam} from 'nestjs-config';
import {TransformInterceptor} from '../interceptors';

@Injectable()
export default class UserController {
    
    
    @Get("/") // <-- nestjs decorator will work fine because it placed after @Configurable()
    @Configurable()
    @UseInterceptors(TransformInterceptor) // <-- nestjs decorator won't work because it placed after @Configurable()
    index(@ConfigParam('my.parameter', 'deafult value') parameter?: string) {
        return { data: parameter };
    }
}
```

## Typeorm 

Usage with typeorm requires the use of the `forRootAsync` function supplied by the typeorm package for nestjs

```typescript
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from 'nestjs-config';
import {TypeOrmModule} from '@nestjs/typeorm';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.load(path.resolve(__dirname, 'config/**/*.{ts,js}')),
        TypeOrmModule.forRootAsync({
            useFactory: (config: ConfigService) => config.get('database'),
            inject: [ConfigService],
        }),
    ],
})
export default class AppModule {}
```

And your config file: 

```typescript 
//config/database.ts
export default {
    type: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
};
```

Built from Fenos, Shekohex and Bashleigh
