import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import threeSpeakLogo from '../assets/snapie3speak.webp';

const VideoCompressor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('28');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [message, setMessage] = useState('');
  
  const ffmpegRef = useRef(new FFmpeg());

  const compressionPresets = {
    '24': { label: 'Light', description: 'Slight compression, best quality' },
    '28': { label: 'Medium', description: 'Balanced size vs. quality' },
    '32': { label: 'Strong', description: 'Maximum compression, smaller file' }
  };

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    
    if (ffmpegLoaded) return;
    
    setMessage('Loading FFmpeg...');
    
    try {
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });
      
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Use the default CDN URLs
      await ffmpeg.load();
      
      setFfmpegLoaded(true);
      setMessage('FFmpeg loaded successfully!');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      setMessage('Failed to load FFmpeg. Please refresh and try again.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setCompressedUrl(null);
      setCompressedSize(0);
      setProgress(0);
      setMessage('');
    }
  };

  const compressVideo = async () => {
    if (!selectedFile || !ffmpegLoaded) {
      if (!ffmpegLoaded) {
        await loadFFmpeg();
        return;
      }
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setMessage('Starting compression...');

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Set up progress tracking for compression
      ffmpeg.on('progress', ({ progress }) => {
        const percentage = Math.round(progress * 100);
        setProgress(percentage);
        if (percentage > 0) {
          setMessage(`Processing video... ${percentage}%`);
        }
      });
      
      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(selectedFile));
      setMessage('Processing video...');

      // Run compression
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vcodec', 'libx264',
        '-crf', compressionLevel,
        '-preset', 'fast',
        '-movflags', '+faststart',
        'output.mp4'
      ]);

      // Read output file
      const data = await ffmpeg.readFile('output.mp4');
      const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(compressedBlob);
      
      setCompressedUrl(url);
      setCompressedSize(data.buffer.byteLength);
      setMessage('Compression completed!');
      
      // Cleanup
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      
      // Remove progress listener
      ffmpeg.off('progress');
      
    } catch (error) {
      console.error('Compression failed:', error);
      setMessage('Compression failed. Please try again.');
      // Remove progress listener on error too
      ffmpegRef.current.off('progress');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const downloadCompressed = () => {
    if (compressedUrl) {
      const link = document.createElement('a');
      link.href = compressedUrl;
      link.download = `compressed_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = () => {
    if (originalSize && compressedSize) {
      const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      return `${ratio}% smaller`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src={threeSpeakLogo} 
              alt="3Speak Logo" 
              className="h-12 w-auto object-contain"
            />
            <span className="text-4xl">🎬</span>
            <h1 className="text-4xl font-bold text-gray-900">
              Simple Video Compressor
            </h1>
          </div>
          <p className="text-lg text-gray-500">
            Compress videos locally in your browser - no uploads required
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* File Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600 file:cursor-pointer file:transition-colors
                border-2 border-dashed border-blue-200 rounded-xl p-6 hover:border-blue-300
                transition-colors duration-200"
            />
          </div>

          {/* Compression Settings */}
          {selectedFile && (
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Compression Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(compressionPresets).map(([value, preset]) => (
                  <button
                    key={value}
                    onClick={() => setCompressionLevel(value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      compressionLevel === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-sm text-gray-600">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Info */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-blue-25 border border-blue-100 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">File Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedFile.name}
                </div>
                <div>
                  <span className="font-medium">Original Size:</span> {formatFileSize(originalSize)}
                </div>
                {compressedSize > 0 && (
                  <>
                    <div>
                      <span className="font-medium">Compressed Size:</span> {formatFileSize(compressedSize)}
                    </div>
                    <div>
                      <span className="font-medium">Reduction:</span> 
                      <span className="text-green-600 font-semibold ml-1">{getCompressionRatio()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{message}</span>
                <span className="font-semibold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out relative shadow-sm"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
                  )}
                </div>
              </div>
              {progress > 0 && (
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Compressing video with {compressionPresets[compressionLevel].label.toLowerCase()} compression...
                </div>
              )}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${
              message.includes('failed') || message.includes('Failed')
                ? 'bg-red-50 text-red-700 border-red-200'
                : message.includes('completed') || message.includes('successfully')
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={!ffmpegLoaded ? loadFFmpeg : compressVideo}
              disabled={!selectedFile || isLoading}
              className="flex-1 bg-blue-500 text-white py-3 px-8 rounded-full font-bold text-lg
                hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105
                disabled:transform-none disabled:shadow-md"
            >
              {!ffmpegLoaded ? 'Load FFmpeg' : isLoading ? 'Compressing...' : 'Compress Video'}
            </button>

            {compressedUrl && (
              <button
                onClick={downloadCompressed}
                className="flex-1 bg-green-500 text-white py-3 px-8 rounded-full font-bold text-lg
                  hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl
                  transform hover:scale-105"
              >
                Download Compressed Video
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm mb-2">
            All processing happens locally in your browser. No files are uploaded to any server.
          </p>
          <p className="text-xs text-gray-400">
            Built for the <span className="text-blue-500 font-semibold">3Speak Community</span> with ❤️ by <span className="text-blue-500 font-semibold">@meno</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCompressor;