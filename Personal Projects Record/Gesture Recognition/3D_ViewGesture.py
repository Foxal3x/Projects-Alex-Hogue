import numpy as np
import open3d as o3d
import time
import mediapipe as mp
import cv2

BaseOptions=mp.tasks.BaseOptions
HandLandmarker=mp.tasks.vision.HandLandmarker
HandLandmarkerOptions=mp.tasks.vision.HandLandmarkerOptions
HandLandmarkerResult=mp.tasks.vision.HandLandmarkerResult
VisionRunningMode=mp.tasks.vision.RunningMode
MODEL_PATH= "C:/Users/alexh/Media Pipe/hand_landmarker.task"
detected_landmarks=[]

vis = o3d.visualization.VisualizerWithKeyCallback()
vis.create_window(window_name="Real-Time 3D Viewport")
pcd=o3d.geometry.PointCloud()
points = np.random.rand(1000, 3)  # 1000 random 3D points
pcd.points = o3d.utility.Vector3dVector(points)
vis.add_geometry(pcd)
coordinate_frame = o3d.geometry.TriangleMesh.create_coordinate_frame(size=2, origin=[0, 0, 0])
vis.add_geometry(coordinate_frame)

exit_flag = False
def exit_callback(vis):
    global exit_flag
    exit_flag = True
vis.register_key_callback(ord("Q"), exit_callback)


def draw_landmarks(frame,hand_landmarks):
    height,width,_=frame.shape
    HAND_CONNECTIONS=mp.solutions.hands.HAND_CONNECTIONS
    
    for landmarks in hand_landmarks:
        landmark_points=[ (int(l.x*width),int(l.y*height))for l in landmarks]

        for point in landmark_points:
            cv2.circle(frame,point,5,(0,255,0),-1)

            for connection in HAND_CONNECTIONS:
                start_idx,end_idx=connection
                if start_idx<len(landmark_points) and end_idx<len(landmark_points):
                    cv2.line(frame,landmark_points[start_idx],landmark_points[end_idx],(255,0,0),2)

def process_results(result:HandLandmarkerResult,output_image:mp.Image,timestamp_ms:int):
    global detected_landmarks
    detected_landmarks=result.hand_landmarks if result.hand_landmarks else []

    if result.hand_landmarks:
        print("\n=== Hand Landmarks Detected ===")
        for i, hand in enumerate(result.hand_landmarks):
            print(f"Hand {i+1}:")
            points = np.zeros((21, 3))
            for idx,landmark in enumerate(hand):
                points[idx] = [landmark.x, landmark.y, landmark.z]
                print(f"  Landmark {idx}: x={landmark.x:.3f}, y={landmark.y:.3f}, z={landmark.z:.3f}")
            pcd.points=o3d.utility.Vector3dVector(points)

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=process_results
)

cap=cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

with HandLandmarker.create_from_options(options) as landmarker:
    print("HandLandmarker initialized successfully!")

    while cap.isOpened():
        ret,frame=cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        landmarker.detect_async(mp_image, timestamp_ms=int(cv2.getTickCount() / cv2.getTickFrequency() * 1000))
        if detected_landmarks:
            draw_landmarks(frame, detected_landmarks)

        vis.update_geometry(pcd)
        vis.poll_events()
        vis.update_renderer()

        cv2.imshow("Hand Landmarker Live", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        

cap.release()
cv2.destroyAllWindows()