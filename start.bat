@echo off
echo Starting FixitAI Backend...
start cmd /k "cd backend && ..\venv\Scripts\activate && python run.py"

echo Starting FixitAI Frontend...
start cmd /k "cd frontend && npm run dev"

echo Done! Both servers are starting in new windows.
