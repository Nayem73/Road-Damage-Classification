import tflite_runtime.interpreter as tflite
import numpy as np
from PIL import Image

class RoadDamageML:
    def __init__(self):
        """
        Load the pre-trained model for road damage classification.
        """
        road_model = tflite.Interpreter('ML_damage/tfliteModels/road.tflite')
        self.model_dict = {
            'Road': [road_model, 128]  # 'Road' is the category for road damage
        }
        self.get_interpreter_input_output_details()
        
        self.class_name_dict = {
            'Road': ['good', 'poor', 'satisfactory', 'very poor']  # Damage classes
        }

    def get_interpreter_input_output_details(self):
        for model in self.model_dict.keys():
            self.model_dict[model][0].allocate_tensors()
            input_details = self.model_dict[model][0].get_input_details()
            output_details = self.model_dict[model][0].get_output_details()
            self.model_dict[model].append(input_details)
            self.model_dict[model].append(output_details)
        
    def image_tf_reshape(self, image, img_shape):
        if type(image) == np.ndarray:
            image = Image.fromarray(image.astype('uint8'), 'RGB')
        image = np.array(image.resize((img_shape, img_shape)))
        image = np.expand_dims(image, axis=0)
        return image.astype(np.float32)
        
    def predict(self, image, damage_type):
        """
        Predict the condition of the road based on the provided image.
        """
        try:
            if damage_type not in self.model_dict:
                raise ValueError(f"Damage type '{damage_type}' not found in model_dict keys: {list(self.model_dict.keys())}")

            img_shape = self.model_dict[damage_type][1]
            img = self.image_tf_reshape(image, img_shape)

            model = self.model_dict[damage_type][0]
            input_details = self.model_dict[damage_type][2]
            output_details = self.model_dict[damage_type][3]

            model.set_tensor(input_details[0]['index'], img)
            model.invoke()

            pred_prob = model.get_tensor(output_details[0]['index'])
            arg_max_pred = pred_prob.argmax()
            return f"{self.class_name_dict[damage_type][arg_max_pred]}"
        except KeyError as ke:
            print(f"KeyError: {ke}")
            raise KeyError(f"Invalid damage type: {damage_type}. Ensure it matches model_dict keys exactly.")
        except Exception as e:
            print(f"Unexpected error in prediction: {e}")
        raise e  # Re-raise the exception for further debugging
