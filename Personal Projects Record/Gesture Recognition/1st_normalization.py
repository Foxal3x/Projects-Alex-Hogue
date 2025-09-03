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
global lines
lines=None
pcd.points = o3d.utility.Vector3dVector(points)
coordinate_frame = o3d.geometry.TriangleMesh.create_coordinate_frame(size=0.1, origin=[0, 0, 0])
vis.add_geometry(coordinate_frame)
vis.add_geometry(pcd)

HAND_CONNECTIONS_ROBOT=np.array([[[4,3,2],[3,2,1],[2,1,0]],[[8,7,6],[7,6,5],[6,5,0]],[[12,11,10],[11,10,9],[10,9,0]],[[16,15,14],[15,14,13],[14,13,0]],[[20,19,18],[19,18,17],[18,17,0]]])


exit_flag = False
def exit_callback(vis):
    global exit_flag
    exit_flag = True
vis.register_key_callback(ord("Q"), exit_callback)

def normalize(points,index1,index2,index3):
    p1=points[index1]
    p2=points[index2]
    p3=points[index3]

    vx=p2-p1
    vx=vx/np.linalg.norm(vx)
    temp=p3-p1
    vy=temp-np.dot(temp,vx)*vx
    vy=vy/np.linalg.norm(vy)
    vz=np.cross(vx,vy)
    R = np.column_stack((vx, vy, vz))

    points=(points-p1)@R
    return points

def normalize_scale(points, index1, index2, target_distance=1.0):
    # Compute the current distance between two points.
    current_distance = np.linalg.norm(points[index1] - points[index2])
    if current_distance == 0:
        return points
    scale = target_distance / current_distance
    return points * scale

# Global buffer and window size for moving average
normalized_buffer = []
window_size = 5

def smooth_codes(new_points):
    global normalized_buffer
    normalized_buffer.append(new_points)
    if len(normalized_buffer) > window_size:
        normalized_buffer.pop(0)
    # Compute the mean along the 0-axis (i.e., average over the frames)
    return np.mean(np.array(normalized_buffer), axis=0)

"""
points=np.array([[1,1,1],[10,10,10],[6,3,0]])
points=points/10
colors = np.array([[0, 0, 0] for _ in range(len(points))])
pcd.colors = o3d.utility.Vector3dVector(colors)
#vis.add_geometry(pcd)
coordinate_frame = o3d.geometry.TriangleMesh.create_coordinate_frame(size=0.1, origin=[0, 0, 0])
vis.add_geometry(coordinate_frame)
points=normalize(points,0,1,2)
pcd.points = o3d.utility.Vector3dVector(points)
vis.add_geometry(pcd)
vis.run()
"""

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


def draw_lines(points, connections, color=[0, 0, 1]):
    line = o3d.geometry.LineSet()
    line.points = o3d.utility.Vector3dVector(points)
    line.lines = o3d.utility.Vector2iVector(connections)

    line_colors = [color for _ in range(len(connections))]
    line.colors = o3d.utility.Vector3dVector(line_colors)
    return line

def calculate_angles(points):
    fingers=np.zeros((5,3))
    index=0
    for finger in HAND_CONNECTIONS_ROBOT:
        for connection in finger:
            print (connection)
            v1=points[connection[1]]-points[connection[0]]
            v2=points[connection[2]]-points[connection[0]]
            theta = np.arccos(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
            fingers[index]=theta
            #print(np.degrees(theta))
        index+=1
    return fingers

#points = np.random.rand(21, 3)
#calculate_angles(points)

def show_3D_Hand(fingers):
    
    cv2.circle(frame,point,5,(0,255,0),-1)


def process_results(result:HandLandmarkerResult,output_image:mp.Image,timestamp_ms:int):
    global detected_landmarks,lines
    detected_landmarks=result.hand_landmarks if result.hand_landmarks else []

    if result.hand_landmarks:
        print("\n=== Hand Landmarks Detected ===")
        for i, hand in enumerate(result.hand_landmarks):
            print(f"Hand {i+1}:")
            points = np.zeros((21, 3))
            for idx,landmark in enumerate(hand):
                points[idx] = [landmark.x, landmark.y, landmark.z]
                print(f"  Landmark {idx}: x={landmark.x:.3f}, y={landmark.y:.3f}, z={landmark.z:.3f}")
            points=normalize(points,0,5,17)
            points = normalize_scale(points, 0, 5, target_distance=1.0)
            points = smooth_codes(points)
            connections = list(mp.solutions.hands.HAND_CONNECTIONS)
            pcd.points = o3d.utility.Vector3dVector(points)

            if lines is None:
                lines = draw_lines(points, connections, color=[0, 0, 1])
                vis.add_geometry(lines)
            else:
                lines.points = o3d.utility.Vector3dVector(points)
                lines.lines = o3d.utility.Vector2iVector(connections)

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
        vis.update_geometry(lines)

        vis.poll_events()
        vis.update_renderer()

        cv2.imshow("Hand Landmarker Live", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        

cap.release()
cv2.destroyAllWindows()