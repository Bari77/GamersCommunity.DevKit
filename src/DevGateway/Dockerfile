# Build from DevKit repo root (BuildKit):
#   docker build -f src/DevGateway/Dockerfile --secret id=nuget_token,env=GITHUB_TOKEN -t gc-devgateway .

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY nuget.config ./
COPY src/DevGateway/DevGateway.csproj src/DevGateway/

RUN --mount=type=secret,id=nuget_token \
    TOKEN="$(cat /run/secrets/nuget_token)" \
    && dotnet nuget update source github \
         --username "x-access-token" \
         --password "$TOKEN" \
         --store-password-in-clear-text \
    && dotnet restore "src/DevGateway/DevGateway.csproj"

COPY src/DevGateway/ src/DevGateway/
WORKDIR /src/src/DevGateway
RUN dotnet publish "DevGateway.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["dotnet", "DevGateway.dll"]
