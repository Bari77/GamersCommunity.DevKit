# Build from this game repo only (Core from GitHub NuGet Packages).

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
ARG GITHUB_TOKEN=
WORKDIR /src

COPY nuget.config ./
COPY __GamePascal__.Consumer/__GamePascal__.Consumer.csproj __GamePascal__.Consumer/
COPY __GamePascal__.Database/__GamePascal__.Database.csproj __GamePascal__.Database/

RUN if [ -n "$GITHUB_TOKEN" ]; then \
      dotnet nuget update source github \
        --username "x-access-token" \
        --password "$GITHUB_TOKEN" \
        --store-password-in-clear-text; \
    fi \
    && dotnet restore "__GamePascal__.Consumer/__GamePascal__.Consumer.csproj"

COPY __GamePascal__.Consumer/ __GamePascal__.Consumer/
COPY __GamePascal__.Database/ __GamePascal__.Database/
WORKDIR /src/__GamePascal__.Consumer
RUN dotnet publish "__GamePascal__.Consumer.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "__GamePascal__.Consumer.dll"]
