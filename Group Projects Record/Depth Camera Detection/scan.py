import pyzed.sl as sl
import cv2

# Initialize the ZED camera
zed = sl.Camera()

# Set up the configuration parameters
init_params = sl.InitParameters()
init_params.depth_mode = sl.DEPTH_MODE.PERFORMANCE  # Use performance depth mode for faster detection
init_params.coordinate_units = sl.UNIT.METER  # Set to meters

# Open the ZED camera
if zed.open(init_params) != sl.ERROR_CODE.SUCCESS:
    print("Unable to open ZED camera.")
    exit(1)

# Enable Object Detection
obj_param = sl.ObjectDetectionParameters()
obj_param.enable_tracking = True  # Enables tracking for consistent IDs
obj_param.detection_model = sl.DETECTION_MODEL.HUMAN_BODY_FAST  # Fast human detection model

# Enable object detection
if zed.enable_object_detection(obj_param) != sl.ERROR_CODE.SUCCESS:
    print("Failed to enable object detection.")
    exit(1)

# Runtime parameters
runtime_params = sl.RuntimeParameters()
obj_runtime_param = sl.ObjectDetectionRuntimeParameters()
obj_runtime_param.detection_confidence_threshold = 50  # Set confidence threshold

# Initialize objects to retrieve data
objects = sl.Objects()
image = sl.Mat()

try:
    while True:
        # Capture a frame
        if zed.grab(runtime_params) == sl.ERROR_CODE.SUCCESS:
            # Retrieve the image for visualization
            zed.retrieve_image(image, sl.VIEW.LEFT)
            frame = image.get_data()
            
            # Retrieve objects (detections)
            zed.retrieve_objects(objects, obj_runtime_param)

            for obj in objects.object_list:
                if obj.label == sl.OBJECT_CLASS.PERSON:  # Check if the detected object is a human
                    distance = obj.position[2]  # Z-axis distance in meters
                    print(f"Detected a person at a distance of {distance:.2f} meters.")
                    
                    # Draw a rectangle around the detected human
                    bbox = obj.bounding_box_2d
                    cv2.rectangle(frame, (int(bbox[0][0]), int(bbox[0][1])),
                                  (int(bbox[2][0]), int(bbox[2][1])), (0, 255, 0), 2)

            # Display the image with detections
            cv2.imshow("ZED2 Human Detection", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

finally:
    # Clean up
    cv2.destroyAllWindows()
    zed.disable_object_detection()
    zed.close()
