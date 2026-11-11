@echo off
echo ====================================================
echo Starting Mumbai Vidi Tambakhu Sangh (MTVS) Portal...
echo ====================================================
cd /d "%~dp0backend"
start http://localhost:4000
node server.js
pause

