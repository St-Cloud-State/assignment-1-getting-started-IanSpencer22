# Use the official Python image as a base
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the contents of your folder to the working directory
COPY . .

# Install required Python packages if you have a requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your application will run on (if any)
EXPOSE 5000

# Command to run your application (adjust as needed)
CMD ["python", "app.py"]