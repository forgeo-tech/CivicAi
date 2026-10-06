# CivicAI

## 1. Project Overview
CivicAI is an AI-powered public infrastructure monitoring and emergency route intelligence system built as a 4-hour hackathon MVP.

The application allows users to upload images of infrastructure issues (like potholes or broken streetlights). An AI service analyzes these images. **Users select the infrastructure location directly on an interactive map, and the system automatically captures latitude/longitude and resolves a human-readable address.** Municipal workers can view an admin dashboard to generate actionable Work Orders. Additionally, an Emergency Route feature allows users to check routes between two map-selected locations for high-risk hazards.

## 2. Features
- **Image Upload & Analysis**: Upload infrastructure images to be analyzed.
- **Map-Based Location Selection**: Select infrastructure issues directly on an interactive map (replaces manual entry), with reverse geocoding to automatically capture addresses.
- **Incident Dashboard**: View all reported issues, visually indicating severity and a calculated priority score (0-100).
- **Municipal Work Orders**: 1-click generation of work orders tied to specific incidents.
- **Emergency Route Intelligence**: Interactive Leaflet maps to check for hazards between map-selected origin/destination coordinates based on local incidents.
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
│   │   ├── components/     # React Components (Upload, Dashboard, LocationPicker, etc.)
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

Open `http://localhost:5173` in your browser.

## 9. AI Model Setup
**Current Status**: The app currently defaults to a **Synthetic Demo Fallback** (`DemoFallbackService`).

*   **Which model is used:** Ultralytics YOLOv8 backend is scaffolded but omitted pending actual trained weights.
*   **How to enable real AI:** Place your trained `.pt` model file in the `backend/` directory. Set the environment variable `AI_MODEL=your_model.pt` in `backend/.env`.
*   **GPU Acceleration:** PyTorch `2.14.1+cu130` is installed. When the YOLO model is enabled, it will utilize CUDA automatically if your RTX 3050 is detected.

## 10. Database
*   **Type**: SQLite.
*   **Location**: `backend/data/civicai.db`.
*   **Migrations**: Handled manually if needed via simple script for MVP.
*   **Resetting**: To reset the database, simply delete `backend/data/civicai.db` and restart the backend.

## 11. API Documentation
*Swagger UI is available at `http://localhost:8000/docs` when the backend is running.*

| Method | Endpoint | Purpose | Request | Response |
| - | - | - | - | - |
| `GET` | `/api/health` | Check API Health | None | `{"status": "ok"}` |
| `POST` | `/api/incidents/upload` | Upload image, run AI, create incident | `multipart/form-data` | `AnalyzeResponse` JSON |
| `GET` | `/api/incidents/` | List all incidents | None | Array of `IncidentResponse` |
| `POST` | `/api/work-orders/{id}` | Generate Work Order | None | `WorkOrderResponse` |
| `POST` | `/api/routes/emergency` | Check route hazards | `RouteRequest` JSON | `RouteResponse` JSON |

## 12. Frontend Usage
1.  **Upload Tab**: Select an image. Use the interactive map to select the incident location by tapping/clicking (it auto-reverse-geocodes). Click *Upload & Submit*.
2.  **Dashboard Tab**: View the reported incident and its status (e.g., Reported, Verified). Click the incident to update status.
3.  **Emergency Route Tab**: Use two interactive maps to *Select Origin* and *Select Destination*. The system converts these map taps into coordinates backend for analysis.

## 13. Location Services
- **Map-based Selection**: Replaces manual coordinate input. Uses `react-leaflet` and OpenStreetMap.
- **Reverse Geocoding**: Uses OSM Nominatim API to provide readable addresses.
- **Current Location**: A "Use my current location" button is available in the location picker, requiring browser geolocation permission only upon explicit click.
- **Privacy**: No location data is stored until the user explicitly submits an incident or checks a route.

## 14. Troubleshooting
*   **Port in Use (5173 / 8000)**: If `npm run dev` or `python run.py` fail, kill the existing process or alter the port in `vite.config.js` and `run.py`.
*   **ExecutionPolicy Error**: If you cannot activate `venv`, open PowerShell as Administrator and run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted`.
*   **Axios/Network Errors**: Ensure the Python backend is running simultaneously on port 8000.

## 15. Project Status
*   **Implemented**: FastApi Backend CRUD API, SQLite incident persistence, React/Vite Frontend, Leaflet Map integration, Work Order Generation, Synthetic Demo Switch, Interactive Location Picker, Osm Nominatim Reverse Geocoding.
*   **Planned/Not Implemented**: Real AI Inference weights, OSRM road network snapping, Authentication (JWT), Real-time traffic, Celery asynchronous processing.
