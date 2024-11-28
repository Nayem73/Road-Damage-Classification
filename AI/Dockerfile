# Use the official Python base image
FROM python:3.8-slim

# Install required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc g++ \
    libsm6 libxext6 libxrender-dev ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY ./requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

# Create and copy application files
RUN mkdir /app
COPY . /app

# Set the working directory
WORKDIR /app

# Expose the application's port
EXPOSE 8000

# Run the application
CMD ["python", "app.py"]
