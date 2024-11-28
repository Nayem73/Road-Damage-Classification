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

    def analyze_video(self, video_path, damage_type, frame_skip=5):
        """
        Analyze a video and classify each frame for road damage.
        
        :param video_path: Path to the input video file.
        :param damage_type: Type of damage to classify (e.g., 'Road').
        :param frame_skip: Number of frames to skip between analyses for efficiency.
        :return: Dictionary with summary percentages for each damage type.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Unable to open video file: {video_path}")

        frame_results = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Process every nth frame for efficiency
            if frame_count % frame_skip == 0:
                damage_class = self.analyze_frame(frame, damage_type)
                if damage_class:
                    frame_results.append(damage_class)

            frame_count += 1

        cap.release()

        if not frame_results:
            raise ValueError("No frames were successfully analyzed.")

        # Count occurrences of each damage type
        damage_counts = Counter(frame_results)
        total_frames = sum(damage_counts.values())
        summary = {key: (count / total_frames) * 100 for key, count in damage_counts.items()}

        return {
            "summary": summary,
            "total_frames": total_frames,
            "analyzed_frames": len(frame_results),
            "damage_counts": damage_counts,
        }
