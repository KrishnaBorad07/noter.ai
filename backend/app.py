from flask import Flask, request, send_file
from flask_cors import CORS
import os
from moviepy.editor import VideoFileClip
import tempfile

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/convert', methods=['POST'])
def convert_video_to_audio():
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    
    file = request.files['file']
    if file.filename == '':
        return {'error': 'No file selected'}, 400

    try:
        # Create temporary files for video and audio
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        
        # Save uploaded video to temp file
        file.save(temp_video.name)
        
        # Convert video to audio
        video = VideoFileClip(temp_video.name)
        audio = video.audio
        audio.write_audiofile(temp_audio.name)
        
        # Clean up video resources
        video.close()
        audio.close()
        
        # Send the audio file
        response = send_file(
            temp_audio.name,
            as_attachment=True,
            download_name=f"{os.path.splitext(file.filename)[0]}.mp3",
            mimetype='audio/mpeg'
        )
        
        # Clean up temp files after sending
        @response.call_on_close
        def cleanup():
            os.unlink(temp_video.name)
            os.unlink(temp_audio.name)
            
        return response
        
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
