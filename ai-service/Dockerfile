# Use official Python image
FROM python:3.10-slim
WORKDIR /app

# Install FFmpeg, Build Tools, and Rust Compiler (for Whisper/tiktoken)
RUN apt-get update && apt-get install -y ffmpeg gcc g++ make rustc cargo git

# Upgrade pip to ensure it downloads pre-built wheels
RUN pip install --no-cache-dir --upgrade pip

# Install Python packages
COPY requirements.txt .
# PyTorch ka sirf chota CPU version pehle install karein taaki Render crash na ho
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir setuptools wheel setuptools-rust
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Run the FastAPI server
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]