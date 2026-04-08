from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import math

app = FastAPI()

# --- Data Models ---

class Camera(BaseModel):
    id: str
    lat: float
    lon: float
    angle: float  # Degrees, 0 is North, 90 is East
    fov: float = 60.0 # Field of View in degrees
    name: Optional[str] = None
    source: str = "0" # Default to webcam 0
    height: float = 3.0 # Height in meters
    tilt: float = 15.0 # Tilt in degrees (0=horizontal, 90=down)

class DetectionData(BaseModel):
    camera_id: str
    count: int
    # List of detected people positions relative to the camera
    # x: horizontal offset (meters), y: depth/distance (meters)
    positions: List[Dict[str, float]] 
    frame: Optional[str] = None # Base64 encoded JPEG

# --- In-Memory Storage ---
# --- In-Memory Storage ---
cameras: Dict[str, Camera] = {
    "cam_1": Camera(
        id="cam_1",
        lat=20.8880,      # Somnath Mandir Latitude
        lon=70.4010,      # Somnath Mandir Longitude
        angle=0,          # Facing North
        fov=60,
        name="Main Gate Camera",
        source="0",
        height=3.0,
        tilt=15.0
    )
}
# Store latest heatmap points as (lat, lon, intensity) with timestamps for cleanup
heatmap_data: List[Dict[str, float]] = []
# Store latest frame per camera
camera_frames: Dict[str, bytes] = {}

# --- Helper Functions ---

def relative_to_global(cam: Camera, rel_x: float, rel_y: float):
    """
    Convert relative camera coordinates to global lat/lon.
    rel_x: Right (meters)
    rel_y: Forward (meters)
    """
    # Earth radius in meters
    R = 6378137

    # Camera angle in radians (Clockwise from North)
    # 0 = North, 90 = East
    angle_rad = math.radians(cam.angle)
    
    # Rotation Matrix for Compass Bearing
    # We want to rotate the vector (rel_x, rel_y) where y is Forward (North-aligned at 0)
    # and x is Right (East-aligned at 0).
    
    # dNorth = y * cos(a) - x * sin(a)
    # dEast  = y * sin(a) + x * cos(a)
    
    dn = rel_y * math.cos(angle_rad) - rel_x * math.sin(angle_rad)
    de = rel_y * math.sin(angle_rad) + rel_x * math.cos(angle_rad)
    
    # Convert meters to degrees
    dLat = dn / R * (180 / math.pi)
    # Cosine correction for longitude
    dLon = de / (R * math.cos(math.pi * cam.lat / 180)) * (180 / math.pi)
    
    new_lat = cam.lat + dLat
    new_lon = cam.lon + dLon
    
    return new_lat, new_lon

# --- API Endpoints ---

@app.get("/cameras", response_model=List[Camera])
def get_cameras():
    return list(cameras.values())

@app.post("/cameras")
def create_camera(camera: Camera):
    cameras[camera.id] = camera
    return camera

@app.put("/cameras/{camera_id}")
def update_camera(camera_id: str, camera: Camera):
    if camera_id not in cameras:
        raise HTTPException(status_code=404, detail="Camera not found")
    cameras[camera_id] = camera
    return camera

@app.delete("/cameras/{camera_id}")
def delete_camera(camera_id: str):
    if camera_id not in cameras:
        raise HTTPException(status_code=404, detail="Camera not found")
    del cameras[camera_id]
    # Also clear heatmap data for this camera
    if hasattr(app, "camera_points") and camera_id in app.camera_points:
        del app.camera_points[camera_id]
    if camera_id in camera_frames:
        del camera_frames[camera_id]
    return {"status": "deleted"}

@app.post("/cameras/{camera_id}/data")
def receive_data(camera_id: str, data: DetectionData):
    if camera_id not in cameras:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    cam = cameras[camera_id]
    
    # Store frame if present
    if data.frame:
        import base64
        try:
            # Decode base64 to bytes
            frame_bytes = base64.b64decode(data.frame)
            camera_frames[camera_id] = frame_bytes
        except Exception as e:
            print(f"Error decoding frame: {e}")

    # Update global heatmap data
    global_points = []
    for pos in data.positions:
        lat, lon = relative_to_global(cam, pos['x'], pos['y'])
        global_points.append({"lat": lat, "lon": lon, "count": 1})
        
    # Store per-camera points
    if not hasattr(app, "camera_points"):
        app.camera_points = {}
    
    # Replace previous points for this camera with new ones
    app.camera_points[camera_id] = global_points
    
    return {"status": "ok", "processed_points": len(global_points)}

@app.get("/heatmap")
def get_heatmap():
    if not hasattr(app, "camera_points"):
        return []
    
    all_points = []
    for cam_points in app.camera_points.values():
        all_points.extend(cam_points)
    return all_points

from fastapi.responses import Response

@app.get("/cameras/{camera_id}/feed")
def get_camera_feed(camera_id: str):
    if camera_id not in camera_frames:
        # Return a placeholder or 404
        # Let's return a 404 for now, frontend can handle it
        raise HTTPException(status_code=404, detail="No feed available")
    
    return Response(content=camera_frames[camera_id], media_type="image/jpeg")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def read_index():
    return FileResponse('index.html')
