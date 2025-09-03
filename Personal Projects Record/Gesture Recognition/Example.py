import test
import mediapipe as mp
import numpy as np
import os

# Load Mediapipe Hand Landmarker
BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
HandLandmarkerResult = mp.tasks.vision.HandLandmarkerResult
VisionRunningMode = mp.tasks.vision.RunningMode

# Set the correct model path
MODEL_PATH = "C:/Users/alexh/Media Pipe/hand_landmarker.task"

# Global variable to store landmarks
detected_landmarks = []

# Function to overlay landmarks on the video feed
def draw_landmarks_on_image(frame, hand_landmarks):
    """Draws hand landmarks and connections on the OpenCV video frame."""
    height, width, _ = frame.shape  # Get frame dimensions
    HAND_CONNECTIONS = mp.solutions.hands.HAND_CONNECTIONS  # Mediapipe connections

    for landmarks in hand_landmarks:
        landmark_points = [(int(l.x * width), int(l.y * height)) for l in landmarks]

        # Draw landmarks
        for point in landmark_points:
            test.circle(frame, point, 5, (0, 255, 0), -1)  # Green circles

        # Draw connections between landmarks
        for connection in HAND_CONNECTIONS:
            start_idx, end_idx = connection
            if start_idx < len(landmark_points) and end_idx < len(landmark_points):
                test.line(frame, landmark_points[start_idx], landmark_points[end_idx], (255, 0, 0), 2)  # Blue lines

# Function to process results and store landmarks
def process_results(result: HandLandmarkerResult, output_image: mp.Image, timestamp_ms: int):
    """Handles Mediapipe hand detection results and stores landmarks."""
    global detected_landmarks  # Update the global variable
    detected_landmarks = result.hand_landmarks if result.hand_landmarks else []

    if result.hand_landmarks:
        print("\n=== Hand Landmarks Detected ===")
        for i, hand in enumerate(result.hand_landmarks):
            print(f"Hand {i+1}:")
            for idx, landmark in enumerate(hand):
                print(f"  Landmark {idx}: x={landmark.x:.3f}, y={landmark.y:.3f}, z={landmark.z:.3f}")

# Set up HandLandmarker options
options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=process_results
)

# Initialize webcam
cap = test.VideoCapture(0)  # Open default webcam

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

# Initialize the HandLandmarker
with HandLandmarker.create_from_options(options) as landmarker:
    print("HandLandmarker initialized successfully!")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        frame_rgb = test.cvtColor(frame, test.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        # Run the hand landmark detector asynchronously
        landmarker.detect_async(mp_image, timestamp_ms=int(test.getTickCount() / test.getTickFrequency() * 1000))

        # Draw detected landmarks on the frame
        if detected_landmarks:
            draw_landmarks_on_image(frame, detected_landmarks)

        # Show the video feed with landmarks
        test.imshow("Hand Landmarker Live", frame)

        if test.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
test.destroyAllWindows()
