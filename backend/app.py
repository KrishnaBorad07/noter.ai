from flask import Flask, request, jsonify
from flask_cors import CORS
from moviepy.editor import VideoFileClip
from supabase import create_client, Client
import tempfile
import os
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Supabase credentials
SUPABASE_URL = "https://gkklfyvmhxulxdwjmjxz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdra2xmeXZtaHh1bHhkd2ptanh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDUwNDUsImV4cCI6MjA1OTkyMTA0NX0.bBJGZ1ORgqO0iAIzA4aoJPn9LDgYQ1BdfMj6vO4XaZA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/convert', methods=['POST'])
def convert_video_to_audio():
    # user_session = request.headers.get('Authorization')  # Example: Bearer token

    # if not user_session:
    #     return jsonify({'error': 'Unauthorized'}), 401

    # Use the session token to get the user
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({"error":"User ID Missing"}),400 # Extract token
    user_id = user['user']['id']
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    video_file = request.files['file']
    
    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    temp_video = None
    temp_audio = None
    video = None

    try:
        # Create temporary files
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        
        logger.info(f"Saving uploaded file: {video_file.filename}")
        video_file.save(temp_video.name)
        
        logger.info("Converting video to audio")
        video = VideoFileClip(temp_video.name)
        
        if not video.audio:
            raise ValueError("No audio track found in video file")
        
        logger.info("Writing audio file")
        video.audio.write_audiofile(temp_audio.name)
        
        logger.info("Reading audio file for upload")
        with open(temp_audio.name, 'rb') as f:
            file_data = f.read()

        # Generate a unique filename based on original filename
        audio_filename = os.path.splitext(video_file.filename)[0] + '.mp3'
        # Sanitize the filename to remove special characters
        sanitized_filename = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', audio_filename)
        storage_path = f'{user_id}/{sanitized_filename}'

        logger.info(f"Uploading to Supabase: {storage_path}")
        
        # Try to remove existing file if it exists
        try:
            supabase.storage.from_('audio-files').remove([storage_path])
        except:
            pass

        # Upload the new file
        supabase.storage.from_('audio-files').upload(
            path=storage_path,
            file=file_data,
            file_options={"contentType": "audio/mpeg"}
        )

        # Get public URL
        file_url = supabase.storage.from_('audio-files').get_public_url(storage_path)
        logger.info("Successfully uploaded to Supabase")

        return jsonify({
            'success': True,
            'message': 'Audio file created and uploaded successfully!',
            'url': file_url
        })

    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Error during conversion: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up resources
        if video:
            try:
                if hasattr(video, 'reader'):
                    video.reader.close()
                if hasattr(video, 'audio') and video.audio is not None:
                    if hasattr(video.audio, 'reader'):
                        video.audio.reader.close()
                video.close()
            except Exception as e:
                logger.error(f"Error closing video: {str(e)}")

        # Clean up temporary files
        try:
            if temp_video and os.path.exists(temp_video.name):
                os.unlink(temp_video.name)
            if temp_audio and os.path.exists(temp_audio.name):
                os.unlink(temp_audio.name)
        except Exception as e:
            logger.error(f"Error cleaning up files: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
