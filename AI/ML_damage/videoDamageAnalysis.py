import cv2
import numpy as np
from ML_damage.damageClassification import RoadDamageML
from collections import Counter
import random

class VideoDamageAnalyzer:
    def __init__(self):
        """
        Initialize the video analyzer and the road damage classification model.
        """
        self.model = RoadDamageML()
        
        # Initial starting coordinates (kept for reference)
        self.start_latitude = 35.38673905468399
        self.start_longitude = 132.73381553054398

    def generate_realistic_road_path(self, num_frames):
        """
        Generate a road-like path with tighter, more compact movement.
        
        :param num_frames: Number of frames to generate geotags for
        :return: List of geotags simulating a road trajectory
        """
        geotags = []
        current_lat = self.start_latitude
        current_lon = self.start_longitude
        
        # Reduced road-like movement parameters
        lat_step = 0.00005  # Reduced latitude change (half of previous)
        lon_step = 0.0001   # Reduced longitude change (half of previous)
        
        for _ in range(num_frames):
            # Reduced variation range
            lat_variation = random.uniform(-0.0002, 0.0002)
            lon_variation = random.uniform(-0.0002, 0.0002)
            
            # Update coordinates with smaller steps
            new_lat = current_lat + lat_step + lat_variation
            new_lon = current_lon + lon_step + lon_variation
            
            # Update current coordinates
            current_lat = new_lat
            current_lon = new_lon
            
            geotags.append({
                "latitude": current_lat, 
                "longitude": current_lon
            })
        
        return geotags

    def analyze_frame(self, frame, damage_type):
        """
        Analyze a single video frame for road damage classification.
        """
        try:
            # Convert the frame to RGB as the model expects RGB images
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            damage_class = self.model.predict(frame_rgb, damage_type)
            return damage_class
        except Exception as e:
            print(f"Error analyzing frame: {e}")
            return None

    def extract_geotags(self, video_path):
        """
        Extract geotags from the video metadata or simulate GPS data.
        """
        num_frames = int(cv2.VideoCapture(video_path).get(cv2.CAP_PROP_FRAME_COUNT))
        return self.generate_realistic_road_path(num_frames)

    def analyze_video(self, video_path, damage_type, frame_skip=5):
        """
        Analyze a video and classify each frame for road damage.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Unable to open video file: {video_path}")

        frame_results = []
        geotags = self.extract_geotags(video_path)
        frame_count = 0
        analyzed_geotags = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Process every nth frame for efficiency
            if frame_count % frame_skip == 0:
                damage_class = self.analyze_frame(frame, damage_type)
                if damage_class:
                    frame_results.append(damage_class)
                    analyzed_geotags.append(geotags[frame_count])  # Add geotag for the analyzed frame

            frame_count += 1

        cap.release()

        if not frame_results:
            raise ValueError("No frames were successfully analyzed.")

        # Count occurrences of each damage type
        damage_counts = Counter(frame_results)
        total_frames = sum(damage_counts.values())
        summary = {key: (damage_counts.get(key, 0) / total_frames) * 100 
           for key in self.model.class_name_dict[damage_type]}

        return {
            "summary": summary,
            "total_frames": total_frames,
            "analyzed_frames": len(frame_results),
            "damage_counts": damage_counts,
            "geotags": [
                {**geotag, "frame": idx * frame_skip, "damage": frame_results[idx]}
                for idx, geotag in enumerate(analyzed_geotags)
            ]
        }