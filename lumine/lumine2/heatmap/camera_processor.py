import cv2
import argparse
import time
import requests
import json
import torch
import math
from ultralytics import YOLO
# Fix for PyTorch 2.6+ weights_only=True default
# Monkeypatch torch.load to default weights_only=False
_original_load = torch.load
def _safe_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_load(*args, **kwargs)
torch.load = _safe_load

def main():
    parser = argparse.ArgumentParser(description="CrowdMap Camera Processor")
    parser.add_argument("--source", type=str, default="0", help="Initial video source (0 for webcam, or path to file)")
    parser.add_argument("--api", type=str, default="http://localhost:8000", help="API URL")
    parser.add_argument("--id", type=str, required=True, help="Camera ID (must match API)")
    
    args = parser.parse_args()
    
    # Load YOLO model
    print("Loading YOLOv8 model (Nano)...")
    model = YOLO("yolov8n.pt")  # Using nano model for best performance on laptop
    
    # Use a session for persistent connections
    session = requests.Session()
    
    current_source = args.source
    cap = None
    
    def open_source(src):
        print(f"Opening source: {src}")
        if src.isdigit():
            s = int(src)
        else:
            s = src
        return cv2.VideoCapture(s)

    cap = open_source(current_source)
    if not cap.isOpened():
        print(f"Error: Could not open video source {current_source}")
        # Don't exit, maybe API will give a valid source later
    
    print(f"Processing camera {args.id}...")
    
    last_config_check = 0
    config_check_interval = 2.0 # Check every 2 seconds
    
    # Frame skipping optimization
    frame_count = 0
    skip_frames = 5 # Process every 5th frame
    
    while True:
        # Check for config updates
        if time.time() - last_config_check > config_check_interval:
            try:
                res = session.get(f"{args.api}/cameras", timeout=1.0)
                if res.status_code == 200:
                    cameras = res.json()
                    my_cam = next((c for c in cameras if c['id'] == args.id), None)
                    if my_cam:
                        api_source = my_cam.get('source', "0")
                        
                        # Update globals for geometry
                        main.cam_height = my_cam.get('height', 3.0)
                        main.cam_tilt = my_cam.get('tilt', 15.0)
                        main.cam_fov = my_cam.get('fov', 60.0)
                        
                        if api_source != current_source:
                            print(f"Source changed from {current_source} to {api_source}. Switching...")
                            current_source = api_source
                            if cap:
                                cap.release()
                            cap = open_source(current_source)
            except Exception as e:
                # print(f"Error checking config: {e}")
                pass
            last_config_check = time.time()

        if cap is None or not cap.isOpened():
            time.sleep(0.1)
            continue

        ret, frame = cap.read()
        if not ret:
            print("End of stream or error reading frame. Looping/Waiting...")
            if isinstance(current_source, str) and not current_source.isdigit():
                 # Loop file
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            else:
                # Maybe webcam disconnected? Wait and retry
                time.sleep(1)
                cap.release()
                cap = open_source(current_source)
            continue
            
        frame_count += 1
        if frame_count % skip_frames != 0:
            # Just show the frame or skip entirely? 
            # If we want to view smooth video, we might want to show every frame but only process some.
            # But cv2.imshow without waitKey might freeze.
            # Let's show it but not process logic.
            cv2.imshow(f"Camera {args.id}", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue
        
        # Run inference
        # imgsz=640 for speed optimization, 1280 is overkill for heatmap
        # conf=0.25 standard
        results = model(frame, classes=[0], verbose=False, imgsz=640, conf=0.25)
        
        detections = []
        count = 0
        
        # Frame dimensions for normalization/mapping
        height, width, _ = frame.shape
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                count += 1
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Calculate "foot" position (bottom center of box)
                foot_x = (x1 + x2) / 2
                foot_y = y2
                
                # Geometric Distance Estimation
                
                # Use defaults if not set yet
                cam_height = getattr(main, 'cam_height', 3.0)
                cam_tilt = getattr(main, 'cam_tilt', 45.0)
                cam_fov = getattr(main, 'cam_fov', 60.0)
                
                # Convert to radians
                tilt_rad = math.radians(cam_tilt)
                fov_rad = math.radians(cam_fov)
                
                # Vertical FOV (assuming 16:9 aspect ratio)
                # tan(v_fov/2) = tan(h_fov/2) * (h/w)
                fov_v_rad = 2 * math.atan(math.tan(fov_rad/2) * (height/width))
                
                # Normalized coordinates
                
                y_norm = (foot_y - height / 2) / (height / 2)
                x_norm = (foot_x - width / 2) / (width / 2)
                
                # Vertical Angle (Alpha) relative to optical axis
                # positive is "down" from center
                alpha = y_norm * (fov_v_rad / 2)
                
                # Ground Angle (Phi) = Tilt + Alpha
                phi = tilt_rad + alpha
                
                # Distance = Height / tan(Phi)
                # Handle horizon: if phi <= 0, point is at infinity or above horizon.
                if phi <= 0.1: # Clamp to some max distance
                    real_y = 50.0 # Max distance 50m
                else:
                    real_y = cam_height / math.tan(phi)
                    if real_y > 50.0: real_y = 50.0 # Cap at 50m
                    if real_y < 0: real_y = 50.0 # Should not happen if phi > 0
                
                # Horizontal Offset (Real X)
                # Azimuth offset = x_norm * (fov_h / 2)
                azimuth = x_norm * (fov_rad / 2)
                
                # real_x = distance * tan(azimuth)
                real_x = real_y * math.tan(azimuth)
                
                detections.append({"x": real_x, "y": real_y})
                
                # Draw on frame
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                cv2.circle(frame, (int(foot_x), int(foot_y)), 5, (0, 0, 255), -1)

        # Encode frame for streaming
        # Resize to reduce bandwidth (e.g., width 640)
        target_width = 640
        scale = target_width / width
        small_frame = cv2.resize(frame, (target_width, int(height * scale)))
        
        import base64
        _, buffer = cv2.imencode('.jpg', small_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
        frame_b64 = base64.b64encode(buffer).decode('utf-8')
        
        # Send data to API
        payload = {
            "camera_id": args.id,
            "count": len(detections),
            "positions": detections,
            "frame": frame_b64
        }
        
        try:
            session.post(f"{args.api}/cameras/{args.id}/data", json=payload, timeout=0.5)
        except Exception as e:
            # print(f"Error sending data: {e}")
            pass
            
        # Display
        cv2.putText(frame, f"Count: {count} (Opt)", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow(f"Camera {args.id}", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    if cap:
        cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
