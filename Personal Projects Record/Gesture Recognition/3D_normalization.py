import numpy as np
import open3d as o3d
import time

def normalize(points, index1, index2, index3):
    # Use three anchor points to define a new coordinate system.
    p1 = points[index1]
    p2 = points[index2]
    p3 = points[index3]

    # Compute unit vector along x-axis (from p1 to p2)
    vx = p2 - p1
    vx = vx / np.linalg.norm(vx)
    
    # Compute a vector from p1 to p3
    temp = p3 - p1
    # Remove the component along vx to get a vector in the plane
    proj = np.dot(temp, vx) * vx
    vy = temp - proj
    vy = vy / np.linalg.norm(vy)  # Normalize vy
    
    # Compute v_z as the cross product to complete the basis
    vz = np.cross(vx, vy)
    
    # Build the rotation matrix R with columns as the new basis vectors
    R = np.column_stack((vx, vy, vz))
    
    # Transform all points: first translate by -p1 then rotate.
    normalized_points = (points - p1) @ R
    return normalized_points

# Define your original points (for example, 3 points)
points = np.array([[1, 1, 1],
                   [10, 10, 10],
                   [6, 3, 0]])
# Optionally scale the points so they are smaller (this is just your choice)
points = points / 10

# Normalize the points using anchor points at indices 0, 1, and 2.
normalized_points = normalize(points, 0, 1, 2)

# Create a point cloud and update it with the normalized points.
pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(normalized_points)
# Set all points to the same color (black)
colors = np.array([[0, 0, 0] for _ in range(len(normalized_points))])
pcd.colors = o3d.utility.Vector3dVector(colors)

# Create a coordinate frame to visualize the new axes (origin at (0,0,0))
coordinate_frame = o3d.geometry.TriangleMesh.create_coordinate_frame(size=0.1, origin=[0, 0, 0])

# Create the Open3D visualizer and add the coordinate frame and point cloud.
vis = o3d.visualization.VisualizerWithKeyCallback()
vis.create_window(window_name="Real-Time 3D Viewport")
vis.add_geometry(coordinate_frame)
vis.add_geometry(pcd)

# Run the visualizer event loop.
vis.run()
vis.destroy_window()
