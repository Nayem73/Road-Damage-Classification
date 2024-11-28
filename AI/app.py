
from fastapi import FastAPI, File, UploadFile, Form, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
from ML_deseases.diseasesClassification import CropDiseaseML



crop_disease_ml = CropDiseaseML()

app = FastAPI()

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
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict", status_code=status.HTTP_200_OK)
async def predict(response: Response, file: UploadFile = File(...), crop: str = Form(...)):
    try:
        image = read_file_as_image(await file.read())
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            'message': f"Error reading the file: {str(e)}"
        }

    try:
        disease = crop_disease_ml.predict(image, crop)
        if disease:
            return {
                'class': disease,
                'debug': f"Prediction successful for crop: {crop}"
            }
        else:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                'message': f"Prediction failed. Debug info: {crop} not processed.",
                'model_dict_keys': list(crop_disease_ml.model_dict.keys()),  # Add model_dict keys for debugging
                'input_crop': crop  # Show the user-provided crop
            }
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            'message': f"Unexpected error during prediction: {str(e)}",
            'debug_info': {
                'model_dict_keys': list(crop_disease_ml.model_dict.keys()),
                'input_crop': crop
            }
        }


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)