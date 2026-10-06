# CivicAI

## 1. Project Overview
CivicAI is an AI-powered public infrastructure monitoring and emergency route intelligence system built as a 4-hour hackathon MVP. 

The application allows users to upload images of infrastructure issues (like potholes or broken streetlights). An AI service analyzes these images to determine severity and priority, logging the incident into a database. Municipal workers can view an admin dashboard to generate actionable Work Orders. Additionally, an Emergency Route feature allows users to check straight-line routes between two coordinates for high-risk hazards based on reported incidents.

## 2. Features
- **Image Upload & Analysis**: Upload infrastructure images to be analyzed.
- **Incident Dashboard**: View all reported issues, visually indicating severity and a calculated priority score (0-100).
- **Municipal Work Orders**: 1-click generation of work orders tied to specific incidents.
- **Emergency Route Intelligence**: Interactive Leaflet map to check for hazards between an origin and destination coordinate based on local incidents.
- **Graceful AI Fallback**: A synthetic demo fallback mode that simulates AI results when a real model isn't configured, ensuring demo stability.

## 3. Tech Stack
- **Backend API**: Python, FastAPI
- **Database**: SQLite, SQLAlchemy ORM
- **AI/Inference**: PyTorch, Ultralytics (configured for YOLOv8 but currently defaulting to synthetic demo mode).
- **Frontend**: React (v18), Vite
- **Mapping**: Leaflet, OpenStreetMap
- **Styling**: Vanilla CSS (CSS Variables, Flexbox)

## 4. Requirements
- **Operating System**: Windows (tested on Windows 11)
- **Python**: v3.13.6
- **Node.js**: v24.21.0
- **npm**: v11.19.0
- **GPU**: NVIDIA RTX Laptop GPU (e.g., RTX 3050) with 4GB+ VRAM for real inference (CUDA 12+). Not required for the default Demo/Mock mode.

## 5. Project Structure
```text
CivicAI/
├── backend/
│   ├── app/
│   │   ├── api/            # API Routers (incidents, routes, work_orders)
│   │   ├── services/       # AI Inference (inference.py, demo_fallback.py)
│   │   ├── main.py         # FastAPI App Entry point & CORS
│   │   ├── config.py       # Environment variables & constants
│   │   ├── database.py     # SQLAlchemy configuration
│   │   ├── models.py       # SQLAlchemy ORM Models
│   │   └── schemas.py      # Pydantic Schemas
│   ├── data/               # SQLite database directory
│   ├── uploads/            # Temporary image storage
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Uvicorn launcher script
├── frontend/
│   ├── src/
│   │   ├── components/     # React Components (Upload, Dashboard, etc.)
│   │   ├── App.jsx         # Main UI / Routing
│   │   └── main.jsx        # React DOM Entry
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite build & proxy config
├── start.bat               # Helper script to launch both servers
└── README.md
```

## 6. Backend Setup
Open a Windows PowerShell terminal.

```powershell
# Navigate to the backend directory
cd backend

# Create a Python virtual environment (if not already using the global venv)
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# If you get an ExecutionPolicy error, run this first: 
# Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (auto-initializes the SQLite database)
python run.py
```
*Note: The database (`data/civicai.db`) and tables are automatically created on startup via `init_db()`.*

## 7. Frontend Setup

Open a **separate** Windows PowerShell terminal.

```powershell
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```

## 8. Running the Complete Application

For convenience on Windows, you can simply run the provided batch file from the root directory which launches both servers in new command windows:

```powershell
.\start.bat
```

**Manual Approach:**
*   **Terminal 1 (Backend):** `cd backend`; `.\venv\Scripts\activate`; `python run.py` (Runs on `http://localhost:8000`)
*   **Terminal 2 (Frontend):** `cd frontend`; `npm run dev` (Runs on `http://localhost:5173`)

Open `http://localhost:5173` in your browser.

## 9. AI Model Setup
**Current Status**: The app currently defaults to a **Synthetic Demo Fallback** (`DemoFallbackService`).

*   **Which model is used:** Ultralytics YOLOv8 backend is scaffolded but omitted pending actual trained weights.
*   **How to enable real AI:** Place your trained `.pt` model file in the `backend/` directory. Set the environment variable `AI_MODEL=your_model.pt` in `backend/.env`.
*   **Implementation Note:** The actual Ultralytics inference code inside `backend/app/services/__init__.py` is currently commented out as a `# TODO` because a specific infrastructure model file is missing.
*   **GPU Acceleration:** PyTorch `2.14.1+cu130` is installed. When the YOLO model is enabled, it will utilize CUDA automatically if your RTX 3050 is detected.

## 10. Database
*   **Type**: SQLite.
*   **Location**: `backend/data/civicai.db`.
*   **Migrations**: Not used for this MVP. Tables are created cleanly at startup via SQLAlchemy `Base.metadata.create_all()`.
*   **Resetting**: To reset the database, simply delete `backend/data/civicai.db` and restart the backend.
*   **Demo Data**: Handled dynamically! Uploading any image in Demo Mode populates a synthetic database entry.

## 11. API Documentation
*Swagger UI is available at `http://localhost:8000/docs` when the backend is running.*

| Method | Endpoint | Purpose | Request | Response |
| - | - | - | - | - |
| `GET` | `/health` | Check API Health | None | `{"status": "ok"}` |
| `POST` | `/api/incidents/upload` | Upload image, run AI, create incident | `multipart/form-data` (image, lat, lon) | `AnalyzeResponse` JSON |
| `GET` | `/api/incidents/` | List all incidents | None | Array of `IncidentResponse` |
| `POST` | `/api/work-orders/{id}` | Generate Work Order | None | `WorkOrderResponse` |
| `GET` | `/api/work-orders/` | List all Work Orders | None | Array of `WorkOrderResponse` |
| `POST` | `/api/routes/emergency` | Check route hazards | `RouteRequest` JSON (lats/lons) | `RouteResponse` JSON |

## 12. Frontend Usage
1.  **Upload Tab**: Select an image, optionally input a latitude (e.g. `12.9716`) and longitude (e.g. `77.5946`). Click *Upload & Analyze*. (In demo mode, this returns synthetic pothole data).
2.  **Dashboard Tab**: View the newly created incident. Notice the Priority and Severity badges. Click the **Work Order** button on an incident.
3.  **Work Order View**: Review incident details, click **Generate Municipal Work Order** to transition to a tracking ticket.
4.  **Emergency Route Tab**: Enter an Origin and Destination mapping coordinates. Click **Check Route**. A Leaflet map renders the straight-line interpolation, checking boundaries for known high-risk incidents. 

## 13. Environment Variables
To override defaults, create a `.env` file in the `backend/` directory:

| Variable | Required | Purpose | Example |
| -------- | -------- | ------- | ------- |
| `DATA_DIR` | No | Overrides SQLite storage location | `data_prod` |
| `UPLOAD_DIR` | No | Overrides image storage location | `images` |
| `DATABASE_URL` | No | Overrides SQLite connection string | `sqlite:///data/civicai.db` |
| `AI_MODEL` | No | Activates Real AI (name of YOLO weights file) | `yolov8-infrastructure.pt` |
| `AI_CONFIDENCE_THRESHOLD` | No | AI confidence cutoff | `0.45` |

## 14. Testing
Currently, testing relies on manual health checks and the UI endpoints, as no automated test suite leverages the time-boxed MVP context.

**API Health Check:**
```powershell
curl -Uri http://localhost:8000/health
```

## 15. Troubleshooting
*   **Port in Use (5173 / 8000)**: If `npm run dev` or `python run.py` fail due to ports in use, kill the existing process or alter the port in `vite.config.js` and `run.py` respectively.
*   **ExecutionPolicy Error on Windows**: If you cannot activate `venv`, open PowerShell as Administrator and run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted`.
*   **Upload fails with [Errno 22]**: A prior bug with file naming containing colons on Windows was fixed. Ensure you have the latest code.
*   **Axios/Network Errors on Frontend**: Check `vite.config.js`. It routes `/api` to `http://localhost:8000`. Ensure the Python backend is running simultaneously on port 8000.
*   **Database Locked**: SQLite locks if multiple processes try to write. Restart the backend.

## 16. Demo Instructions
1.  Ensure you have a sample JPEG or PNG image ready.
2.  Run `.\start.bat`.
3.  Navigate to `http://localhost:5173`.
4.  Upload the image. Point out the warning banner indicating safe **Demo Mode**.
5.  Switch to Dashboard, show the priority rankings.
6.  Generate a Work Order.
7.  Switch to Emergency Route, use default coordinates (`12.9716, 77.5946` to `12.92, 77.61`), and generate a map showing the red high-risk collision segments based on the incident just created.

## 17. Limitations
*   **Mock AI**: Unless `AI_MODEL` is populated and `backend/app/services/__init__.py` is uncommented with real pytorch weights, the MVP generates purely synthetic AI analysis data.
*   **Routing Logic**: The system checks hazards against a straight-line interpolation between two points rather than snapping to a realistic road network API (like OSRM).
*   **Emergency Feature Disclaimer**: The route checking is *decision support only*. It relies exclusively on previously reported incidents from the database and does not account for real-time live hazards.

## 18. Development Commands
Quick Reference:
```powershell
# Start Backend
cd backend; .\venv\Scripts\activate; python run.py

# Start Frontend
cd frontend; npm run dev

# Wipe DB cleanly
rm backend\data\civicai.db
```

## 19. Project Status
*   **Implemented**: FastApi Backend CRUD API, SQLite incident persistence, React/Vite Frontend, Leaflet Map integration, Work Order Generation, Synthetic Demo Switch.
*   **Partially Implemented**: AI inference (interface created, UI wired, but real model weights missing), Emergency Route mapping (bounding boxes work, but maps via straight line rather than navigable road segments).
*   **Planned/Not Implemented**: Authentication (JWT), Real-time traffic, OSRM road snapping, Celery asynchronous processing.
#   C i v i c A i  
 