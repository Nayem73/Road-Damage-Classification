from fastapi import FastAPI, File, UploadFile, Form, status, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
from ML_damage.damageClassification import RoadDamageML

road_damage_ml = RoadDamageML()

app = FastAPI()

# Set CORS origins to allow cross-origin requests
origins = [
    'http://spring-boot-app'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def read_file_as_image(data) -> np.ndarray:
    """
    Convert uploaded file data to a NumPy array representing the image.
    """
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict", status_code=status.HTTP_200_OK)
async def predict(response: Response, file: UploadFile = File(...), damage_type: str = Form(...)):
    """
    Predict the road damage type based on an uploaded image and damage category.
    """
    try:
        image = read_file_as_image(await file.read())
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            'message': f"Error reading the file: {str(e)}"
        }

    try:
        damage = road_damage_ml.predict(image, damage_type)
        if damage:
            return {
                'class': damage,
                # 'debug': f"Prediction successful for damage type: {damage_type}"
            }
        else:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                'message': f"Prediction failed. Debug info: {damage_type} not processed.",
                'model_dict_keys': list(road_damage_ml.model_dict.keys()),
                'input_damage_type': damage_type
            }
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            'message': f"Unexpected error during prediction: {str(e)}",
            'debug_info': {
                'model_dict_keys': list(road_damage_ml.model_dict.keys()),
                'input_damage_type': damage_type
            }
        }

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
