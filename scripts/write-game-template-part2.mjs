/**
 * Part 2: Consumer, Tests, Front for templates/game
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "templates", "game");
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.replace(/^\n/, ""), "utf8");
}

w(
  "__GamePascal__.Consumer/__GamePascal__.Consumer.csproj",
  `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="GamersCommunity.Core" Version="9.4.0" />
    <PackageReference Include="GamersCommunity.Core.Logging" Version="3.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0" />
    <PackageReference Include="Microsoft.Extensions.Hosting.Abstractions" Version="10.0.0" />
    <PackageReference Include="RabbitMQ.Client" Version="7.2.0" />
    <PackageReference Include="Scrutor" Version="6.1.0" />
    <PackageReference Include="Serilog.Extensions.Hosting" Version="9.0.0" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\\__GamePascal__.Database\\__GamePascal__.Database.csproj" />
  </ItemGroup>
  <ItemGroup>
    <None Update="appsettings.Development.json"><CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory></None>
    <None Update="appsettings.Docker.json"><CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory></None>
    <None Update="appsettings.LocalDocker.json"><CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory></None>
  </ItemGroup>
</Project>
`,
);

w(
  "__GamePascal__.Consumer/Configuration/AppSettings.cs",
  `namespace __GamePascal__.Consumer.Configuration;

public class AppSettings
{
}
`,
);

w(
  "__GamePascal__.Consumer/__GamePascal__ServiceConsumer.cs",
  `using GamersCommunity.Core.Rabbit;
using Microsoft.Extensions.Options;
using Serilog;

namespace __GamePascal__.Consumer;

public class __GamePascal__ServiceConsumer(IOptions<RabbitMQSettings> otps, BusRouter router, ILogger logger)
    : BasicServiceConsumer(otps, router, logger)
{
    public override string QUEUE { get; set; } = "__QueueName__";
}
`,
);

w(
  "__GamePascal__.Consumer/ConsumerWorker.cs",
  `using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace __GamePascal__.Consumer;

public class ConsumerWorker(IServiceScopeFactory scopeFactory, ILogger logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var consumer = scope.ServiceProvider.GetRequiredService<__GamePascal__ServiceConsumer>();
        try
        {
            await consumer.StartListeningAsync(ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            logger.Information("ConsumerWorker stopping (cancellation requested).");
        }
        catch (Exception ex)
        {
            logger.Fatal(ex, "Fatal RabbitMQ communication error. Exiting so the container can restart.");
            throw;
        }
    }
}
`,
);

w(
  "__GamePascal__.Consumer/Services/Data/ItemsService.cs",
  `using GamersCommunity.Core.Services;
using __GamePascal__.Database.Context;
using __GamePascal__.Database.Models;

namespace __GamePascal__.Consumer.Services.Data;

public class ItemsService(__GamePascal__DbContext context)
    : GenericDataService<__GamePascal__DbContext, Item>(context, "Items")
{
}
`,
);

w(
  "__GamePascal__.Consumer/Services/Infra/HealthService.cs",
  `using GamersCommunity.Core.Services;
using __GamePascal__.Database.Context;

namespace __GamePascal__.Consumer.Services.Infra;

public class HealthService(__GamePascal__DbContext context) : HealthService<__GamePascal__DbContext>(context)
{
}
`,
);

w(
  "__GamePascal__.Consumer/Program.cs",
  `using GamersCommunity.Core.Logging;
using GamersCommunity.Core.Rabbit;
using GamersCommunity.Core.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using __GamePascal__.Consumer.Configuration;
using __GamePascal__.Consumer.Services.Infra;
using __GamePascal__.Database.Context;

namespace __GamePascal__.Consumer;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.Title = "__GamePascal__ MicroService";
        try
        {
            var builder = Host.CreateDefaultBuilder(args)
                .ConfigureLogging((context, logging) =>
                {
                    var loggerSettings = context.Configuration.GetSection("LoggerSettings").Get<LoggerSettings>() ?? new LoggerSettings();
                    Logger.Initialize(loggerSettings, "__GamePascal__ MS", context.HostingEnvironment);
                    logging.ClearProviders();
                    Log.Information("Starting ...");
                })
                .ConfigureServices((context, services) =>
                {
                    services.AddOptions<RabbitMQSettings>().Bind(context.Configuration.GetSection("RabbitMQ")).ValidateOnStart();
                    services.AddOptions<AppSettings>().Bind(context.Configuration.GetSection("AppSettings")).ValidateOnStart();
                    services.AddDbContext<__GamePascal__DbContext>((sp, options) =>
                    {
                        var connectionString = context.Configuration.GetConnectionString("Database")
                            ?? throw new InvalidOperationException("Connection string 'Database' is missing.");
                        options.UseSqlServer(connectionString);
                    });
                    services.AddSingleton<Serilog.ILogger>(sp => Log.Logger);
                    services.Scan(scan => scan
                        .FromAssembliesOf(typeof(AppSettings))
                        .AddClasses(c => c.AssignableTo<IBusService>())
                        .AsImplementedInterfaces()
                        .WithScopedLifetime());
                    services.AddScoped<HealthService>();
                    services.AddScoped<BusRouter>();
                    services.AddScoped<__GamePascal__ServiceConsumer>();
                    services.AddHostedService<ConsumerWorker>();
                });

            var host = builder.Build();
            await ApplyDatabaseMigrationsAsync(host.Services);
            var environment = host.Services.GetRequiredService<IHostEnvironment>();
            Log.Information("Started in {Environment} environment...", environment.EnvironmentName);
            await host.RunAsync();
        }
        catch (HostAbortedException ex) { Log.Fatal(ex, "Aborted."); }
        catch (Exception ex) { Log.Fatal(ex, "Terminated unexpectedly."); }
        finally { Log.Information("Stopped ..."); }
    }

    private static async Task ApplyDatabaseMigrationsAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<__GamePascal__DbContext>();
        await dbContext.Database.MigrateAsync();
        Log.Information("Database migrations applied.");
    }
}
`,
);

const appsettings = (catalog, host = "127.0.0.1,14333", rabbit = "localhost") => `{
  "LoggerSettings": { "MinimumLevel": { "Global": "Information" } },
  "ConnectionStrings": {
    "Database": "Server=${host};User Id=sa;Password=Your_password123;Initial Catalog=${catalog};TrustServerCertificate=True;Encrypt=True;"
  },
  "RabbitMQ": {
    "Hostname": "${rabbit}",
    "Username": "admin",
    "Password": "admin",
    "Timeout": 30
  },
  "AppSettings": {}
}
`;

w("__GamePascal__.Consumer/appsettings.Development.json", appsettings("__GamePascal__"));
w("__GamePascal__.Consumer/appsettings.LocalDocker.json", appsettings("__GamePascal__"));
w("__GamePascal__.Consumer/appsettings.Docker.json", appsettings("__GamePascal__", "mssql", "rabbitmq"));
w(
  "__GamePascal__.Consumer/appsettings.json",
  `{
  "Logging": { "LogLevel": { "Default": "Information" } }
}
`,
);
w(
  "__GamePascal__.Consumer/Properties/launchSettings.json",
  `{
  "profiles": {
    "__GamePascal__.Consumer": {
      "commandName": "Project",
      "environmentVariables": { "DOTNET_ENVIRONMENT": "Development" }
    }
  }
}
`,
);

w(
  "__GamePascal__.Tests/__GamePascal__.Tests.csproj",
  `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="10.0.0" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.14.1" />
    <PackageReference Include="xunit" Version="2.9.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.1.4">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\\__GamePascal__.Consumer\\__GamePascal__.Consumer.csproj" />
    <ProjectReference Include="..\\__GamePascal__.Database\\__GamePascal__.Database.csproj" />
  </ItemGroup>
</Project>
`,
);

w(
  "__GamePascal__.Tests/FakeDataset.cs",
  `using __GamePascal__.Database.Context;
using __GamePascal__.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace __GamePascal__.Tests;

public static class FakeDataset
{
    public static __GamePascal__DbContext CreateContext(string? name = null)
    {
        var options = new DbContextOptionsBuilder<__GamePascal__DbContext>()
            .UseInMemoryDatabase(name ?? Guid.NewGuid().ToString())
            .Options;
        var ctx = new __GamePascal__DbContext(options);
        ctx.Items.AddRange(
            new Item { Id = 1, Entitled = "DEMO_SWORD", CreationDate = DateTime.UtcNow, ModificationDate = DateTime.UtcNow },
            new Item { Id = 2, Entitled = "DEMO_SHIELD", CreationDate = DateTime.UtcNow, ModificationDate = DateTime.UtcNow }
        );
        ctx.SaveChanges();
        return ctx;
    }
}
`,
);

w(
  "__GamePascal__.Tests/Services/Data/ItemsServiceTests.cs",
  `using __GamePascal__.Consumer.Services.Data;
using Xunit;

namespace __GamePascal__.Tests.Services.Data;

public class ItemsServiceTests
{
    [Fact]
    public async Task List_ReturnsSeededItems()
    {
        await using var ctx = FakeDataset.CreateContext();
        var svc = new ItemsService(ctx);
        var json = await svc.ListAsync();
        Assert.Contains("DEMO_SWORD", json);
    }
}
`,
);

// Front — keep lean
w(
  "__GamePascal__.Front/package.json",
  `{
  "name": "__GameKebab__.front",
  "version": "0.0.0",
  "scripts": {
    "start": "ng serve --port __FrontPort__",
    "start:mocks": "ng serve --port __FrontPort__",
    "start:api": "ng serve --port __FrontPort__ --configuration api",
    "build": "ng build"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^21.2.17",
    "@angular/cdk": "^21.0.6",
    "@angular/common": "21.2.17",
    "@angular/compiler": "21.2.17",
    "@angular/core": "21.2.17",
    "@angular/forms": "21.2.17",
    "@angular/platform-browser": "21.2.17",
    "@angular/router": "21.2.17",
    "@bari77/gc-msw": "0.2.0",
    "@bari77/gc-playground": "0.2.0",
    "@bari77/gc-sdk": "0.2.0",
    "@nebular/eva-icons": "^17.0.0",
    "@nebular/theme": "^17.0.0",
    "es-module-shims": "^2.8.0",
    "msw": "^2.7.0",
    "rxjs": "7.8.2",
    "tslib": "2.8.1",
    "zone.js": "0.15.1"
  },
  "overrides": { "@angular/cdk": "21.0.6" },
  "devDependencies": {
    "@angular-architects/native-federation-v4": "^21.2.3",
    "@angular-devkit/build-angular": "21.2.15",
    "@angular/build": "21.2.15",
    "@angular/cli": "21.2.15",
    "@angular/compiler-cli": "21.2.17",
    "@softarc/native-federation-orchestrator": "^4.2.2",
    "typescript": "~5.9.2"
  },
  "msw": { "workerDirectory": ["public"] }
}
`,
);

w(
  "__GamePascal__.Front/.npmrc",
  `@bari77:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}
`,
);

w(
  "__GamePascal__.Front/federation.config.mjs",
  `import { withNativeFederation, shareAll } from '@angular-architects/native-federation-v4/config';

export default withNativeFederation({
  name: '__GameCamel__',
  exposes: {
    './Routes': './src/app/__GameKebab__.routes.ts',
  },
  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          '@angular/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          '@angular/cdk': { singleton: true, strictVersion: true, requiredVersion: '21.0.6', build: 'package', includeSecondaries: { keepAll: true } },
          'zone.js': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        },
      },
    ),
  },
  skip: [
    'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket',
    '@angular/cdk/schematics', 'zone.js/node', 'zone.js/testing',
    '@angular/cli', '@angular/build', '@angular/compiler-cli',
    '@angular-architects/native-federation-v4', '@softarc/native-federation-orchestrator',
  ],
  features: { denseChunking: true },
});
`,
);

w(
  "__GamePascal__.Front/tsconfig.json",
  `{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "baseUrl": "./src",
    "paths": { "@core/*": ["app/core/*"] }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
`,
);

w(
  "__GamePascal__.Front/tsconfig.app.json",
  `{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "./out-tsc/app", "types": [] },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
`,
);

w(
  "__GamePascal__.Front/angular.json",
  `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "projects": {
    "__GameKebab__.front": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "__CssPrefix__",
      "architect": {
        "build": {
          "builder": "@angular-architects/native-federation-v4:build",
          "options": {
            "target": "__GameKebab__.front:esbuild:production"
          },
          "configurations": {
            "production": {
              "target": "__GameKebab__.front:esbuild:production"
            },
            "development": {
              "target": "__GameKebab__.front:esbuild:development"
            },
            "api": {
              "target": "__GameKebab__.front:esbuild:development",
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.api.ts"
                }
              ]
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-architects/native-federation-v4:build",
          "options": {
            "target": "__GameKebab__.front:esbuild:development",
            "rebuildDelay": 0,
            "dev": true,
            "port": __FrontPort__,
            "cacheExternalArtifacts": false
          },
          "configurations": {
            "production": { "target": "__GameKebab__.front:esbuild:production", "dev": false },
            "development": { "target": "__GameKebab__.front:esbuild:development", "cacheExternalArtifacts": false },
            "api": {
              "target": "__GameKebab__.front:esbuild:development",
              "cacheExternalArtifacts": false,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.api.ts"
                }
              ]
            }
          },
          "defaultConfiguration": "development"
        },
        "esbuild": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [{ "glob": "**/*", "input": "public" }],
            "styles": [
              "node_modules/@nebular/theme/styles/prebuilt/cosmic.css",
              "src/styles.scss"
            ]
          },
          "configurations": {
            "production": { "outputHashing": "all" },
            "development": { "optimization": false, "extractLicenses": false, "sourceMap": true }
          },
          "defaultConfiguration": "production"
        }
      }
    }
  }
}
`,
);

w("__GamePascal__.Front/src/index.html", `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>__GamePascal__</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <__CssPrefix__-root></__CssPrefix__-root>
</body>
</html>
`);

w("__GamePascal__.Front/src/styles.scss", `html, body { height: 100%; margin: 0; }
`);

w(
  "__GamePascal__.Front/src/main.ts",
  `import { initFederation } from '@angular-architects/native-federation-v4';

initFederation()
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
`,
);

w(
  "__GamePascal__.Front/src/bootstrap.ts",
  `import { bootstrapApplication } from "@angular/platform-browser";
import { bootstrapMocks, shouldUseMocks } from "@bari77/gc-playground";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";
import { environment } from "./environments/environment";

async function main() {
  await bootstrapMocks(shouldUseMocks(environment), async () => {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  });
  await bootstrapApplication(App, appConfig);
}

main().catch(console.error);
`,
);

w(
  "__GamePascal__.Front/src/environments/environment.ts",
  `import { Environment } from "@core/models/environment.model";

export const environment: Environment = {
  production: false,
  apiUrl: "http://localhost:__GatewayPort__/api",
  useMocks: true,
};
`,
);

w(
  "__GamePascal__.Front/src/environments/environment.api.ts",
  `import { Environment } from "@core/models/environment.model";

export const environment: Environment = {
  production: false,
  apiUrl: "http://localhost:__GatewayPort__/api",
  useMocks: false,
};
`,
);

w(
  "__GamePascal__.Front/src/app/core/models/environment.model.ts",
  `export interface Environment {
  production: boolean;
  apiUrl: string;
  useMocks?: boolean;
}
`,
);

w(
  "__GamePascal__.Front/src/app/app.config.ts",
  `import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { routes } from "./app.routes";
import { providePlaygroundUi } from "./playground/provide-playground-ui";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    providePlaygroundUi("cosmic"),
  ],
};
`,
);

w(
  "__GamePascal__.Front/src/app/playground/provide-playground-ui.ts",
  `import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import {
  NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbSpinnerModule, NbThemeModule,
} from "@nebular/theme";

/** Standalone playground only — shell already owns NbThemeModule.forRoot() when federated. */
export function providePlaygroundUi(themeName = "cosmic"): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAnimations(),
    importProvidersFrom(
      NbThemeModule.forRoot({ name: themeName }),
      NbLayoutModule, NbEvaIconsModule, NbCardModule, NbSpinnerModule, NbButtonModule, NbIconModule,
    ),
  ]);
}
`,
);

w(
  "__GamePascal__.Front/src/app/app.ts",
  `import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NbLayoutModule } from "@nebular/theme";
import { environment } from "../environments/environment";

@Component({
  selector: "__CssPrefix__-root",
  standalone: true,
  imports: [RouterOutlet, NbLayoutModule],
  template: \`
    <nb-layout>
      @if (showBanner) {
        <nb-layout-header fixed>
          <span>__GamePascal__ Playground</span>
        </nb-layout-header>
      }
      <nb-layout-column>
        <router-outlet />
      </nb-layout-column>
    </nb-layout>
  \`,
})
export class App {
  protected readonly showBanner = environment.useMocks === true;
}
`,
);

w(
  "__GamePascal__.Front/src/app/app.routes.ts",
  `import { Routes } from "@angular/router";
import { GAME_ROUTES } from "./__GameKebab__.routes";

export const routes: Routes = [
  { path: "", children: GAME_ROUTES },
];
`,
);

w(
  "__GamePascal__.Front/src/app/__GameKebab__.routes.ts",
  `import { Routes } from "@angular/router";
import { HomeContainerComponent } from "./pages/home-container/home-container.component";

export const GAME_ROUTES: Routes = [
  { path: "", component: HomeContainerComponent },
];
`,
);

w(
  "__GamePascal__.Front/src/app/pages/home-container/home-container.component.ts",
  `import { Component, inject, OnInit, signal } from "@angular/core";
import { NbCardModule, NbSpinnerModule } from "@nebular/theme";
import { ItemsService } from "../../features/items/items.service";
import { ItemDto } from "../../features/items/item.dto";

@Component({
  selector: "__CssPrefix__-home-container",
  standalone: true,
  imports: [NbCardModule, NbSpinnerModule],
  templateUrl: "./home-container.component.html",
  styleUrl: "./home-container.component.scss",
})
export class HomeContainerComponent implements OnInit {
  private readonly items = inject(ItemsService);
  readonly list = signal<ItemDto[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.items.list().subscribe({
      next: (data) => { this.list.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
`,
);

w(
  "__GamePascal__.Front/src/app/pages/home-container/home-container.component.html",
  `<nb-card>
  <nb-card-header>__GamePascal__ Items</nb-card-header>
  <nb-card-body>
    @if (loading()) {
      <div [nbSpinner]="true"></div>
    } @else {
      <ul>
        @for (item of list(); track item.id) {
          <li>{{ item.entitled }}</li>
        }
      </ul>
    }
  </nb-card-body>
</nb-card>
`,
);

w("__GamePascal__.Front/src/app/pages/home-container/home-container.component.scss", `:host { display: block; padding: 1rem; }
`);

w(
  "__GamePascal__.Front/src/app/features/items/item.dto.ts",
  `export interface ItemDto {
  id: number;
  entitled: string;
  creationDate?: string;
  modificationDate?: string;
}
`,
);

w(
  "__GamePascal__.Front/src/app/features/items/items.service.ts",
  `import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ItemDto } from "./item.dto";

@Injectable({ providedIn: "root" })
export class ItemsService {
  private readonly url = \`\${environment.apiUrl}/__MicroserviceId__/Items\`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>(this.url);
  }
}
`,
);

w(
  "__GamePascal__.Front/src/mocks/data/items.ts",
  `export const mockItems = [
  { id: 1, entitled: "DEMO_SWORD" },
  { id: 2, entitled: "DEMO_SHIELD" },
  { id: 3, entitled: "DEMO_POTION" },
];
`,
);

w(
  "__GamePascal__.Front/src/mocks/handlers.ts",
  `import { createGatewayListHandler } from "@bari77/gc-msw";
import { environment } from "../environments/environment";
import { mockItems } from "./data/items";

export const handlers = [
  createGatewayListHandler({
    apiUrl: environment.apiUrl,
    microservice: "__MicroserviceId__",
    resource: "Items",
    data: mockItems,
  }),
];
`,
);

w(
  "__GamePascal__.Front/src/mocks/browser.ts",
  `import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
`,
);

w(
  "__GamePascal__.Front/README.md",
  `# __GamePascal__.Front

Angular remote (Native Federation) — port \`__FrontPort__\`, exposes \`./Routes\`.

- \`npm start\` — UI-only (MSW)
- \`npm run start:api\` — game-full DevGateway
`,
);

w(
  "__GamePascal__.Front/public/.gitkeep",
  ``,
);

console.log("Wrote consumer/tests/front");
