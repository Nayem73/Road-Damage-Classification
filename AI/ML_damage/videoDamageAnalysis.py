import cv2
import numpy as np
from ML_damage.damageClassification import RoadDamageML
from collections import Counter

class VideoDamageAnalyzer:
    def __init__(self):
        """
        Initialize the video analyzer and the road damage classification model.
        """
        self.model = RoadDamageML()

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
        This is a placeholder that should be replaced with actual GPS integration.
        
        :param video_path: Path to the input video file.
        :return: List of geotags (latitude, longitude) corresponding to video frames.
        """
        # Simulating geotags for each frame (you can replace this with actual GPS extraction logic)
        num_frames = int(cv2.VideoCapture(video_path).get(cv2.CAP_PROP_FRAME_COUNT))
        geotags = [
            {"latitude": 35.6895 + (i * 0.0001), "longitude": 139.6917 + (i * 0.0001)}
            for i in range(num_frames)
        ]
        return geotags

    def analyze_video(self, video_path, damage_type, frame_skip=5):
        """
        Analyze a video and classify each frame for road damage.
        
        :param video_path: Path to the input video file.
        :param damage_type: Type of damage to classify (e.g., 'Road').
        :param frame_skip: Number of frames to skip between analyses for efficiency.
        :return: Dictionary with summary percentages for each damage type and geotags.
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
