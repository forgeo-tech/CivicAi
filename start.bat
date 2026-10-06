@echo off
echo Starting CivicAI Backend...
start cmd /k "cd backend && ..\venv\Scripts\activate && python run.py"

echo Starting CivicAI Frontend...
start cmd /k "cd frontend && npm run dev"

echo Done! Both servers are starting in new windows.
