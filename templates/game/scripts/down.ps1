#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
if (Get-Command podman -ErrorAction SilentlyContinue) {
  podman compose down @args
} else {
  docker compose down @args
}
