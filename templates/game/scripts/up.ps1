#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not $env:GITHUB_TOKEN) {
    Write-Error "Set GITHUB_TOKEN (PAT read:packages) before compose build/pull. Example: `$env:GITHUB_TOKEN = 'ghp_xxx'"
}

$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

if (Get-Command podman -ErrorAction SilentlyContinue) {
    podman compose up -d --build @args
} else {
    docker compose up -d --build @args
}
