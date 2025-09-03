import open3d as o3d
import numpy as np
import time

# Create a Visualizer with key callback support
vis = o3d.visualization.VisualizerWithKeyCallback()
vis.create_window(window_name="Real-Time 3D Viewport")

# Create an initial point cloud with random points
pcd = o3d.geometry.PointCloud()
points = np.random.rand(1000, 3)  # 1000 random 3D points
pcd.points = o3d.utility.Vector3dVector(points)

# Optionally, set the color of the points (default is white)
# For example, to set them to red:
# colors = np.tile(np.array([[1, 0, 0]]), (1000, 1))
# pcd.colors = o3d.utility.Vector3dVector(colors)

vis.add_geometry(pcd)

exit_flag = False
def exit_callback(vis):
    global exit_flag
    exit_flag = True

# Register key callback: Press Q to exit
vis.register_key_callback(ord("Q"), exit_callback)

vis.run()
"""
# Real-time update loop
while not exit_flag:
    # Update points (here, using random points for demonstration)
    points = np.random.rand(1000, 3)
    pcd.points = o3d.utility.Vector3dVector(points)
    
    vis.update_geometry(pcd)
    vis.poll_events()
    vis.update_renderer()
    
    time.sleep(0.1)

vis.destroy_window()
"""