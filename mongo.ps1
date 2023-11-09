#!/bin/bash

Write-Host "Starting MongoDB docker container" -ForegroundColor Green

docker start mongodb 

Write-Host "Container has been started" -ForegroundColor Green
Write-Host "Waiting for database to start..." -ForegroundColor Green
Start-Sleep 2

Write-Host "MongoDB running" -ForegroundColor Green
docker exec -it mongodb mongosh

docker kill mongodb
Write-Host "MongoDB has been stopped" -ForegroundColor Red

