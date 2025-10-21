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
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src={threeSpeakLogo} 
              alt="3Speak Logo" 
              className="h-16 w-auto mx-auto mb-4 drop-shadow-lg"
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl drop-shadow-sm">🎬</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Simple Video Compressor
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Compress videos locally
          </p>
          <p className="text-sm text-gray-500 mt-2">
            No uploads required • Privacy focused • Works offline
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* File Input */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-25 transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Drop your video here or click to browse</p>
                    <p className="text-sm text-gray-500">Supports MP4, MOV, AVI, MKV and more</p>
                  </div>
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Choose Video File
                  </div>
                </div>
              </div>
            </div>
            {/* File Info Display */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(originalSize)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ready to compress
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compression Settings */}
          {selectedFile && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Choose Your Compression Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(compressionPresets).map(([value, preset]) => {
                  const isSelected = compressionLevel === value;
                  const icons = {
                    '24': '🎆', // Light - sparkles
                    '28': '⚖️',  // Medium - balance
                    '32': '⚡'   // Strong - lightning
                  };
                  return (
                    <button
                      key={value}
                      onClick={() => setCompressionLevel(value)}
                      className={`group p-6 rounded-2xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl ring-4 ring-blue-200 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="text-3xl mb-3">{icons[value]}</div>
                      <div className={`font-bold text-lg mb-2 ${
                        isSelected ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {preset.label}
                      </div>
                      <div className={`text-sm ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {preset.description}
                      </div>
                      {isSelected && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                            Selected
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compression Results */}
          {compressedSize > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">Compression Complete! 🎉</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{formatFileSize(originalSize)}</div>
                  <div className="text-sm text-gray-600">Original Size</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{formatFileSize(compressedSize)}</div>
                  <div className="text-sm text-gray-600">Compressed Size</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">{getCompressionRatio()}</div>
                  <div className="text-sm text-gray-600">Space Saved</div>
                </div>
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
              className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg
                hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105
                disabled:transform-none disabled:shadow-lg group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {!ffmpegLoaded && (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                {isLoading && (
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {!isLoading && ffmpegLoaded && (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {!ffmpegLoaded ? 'Initialize Engine' : isLoading ? 'Compressing...' : 'Compress Video'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform skew-x-12 transition-opacity duration-300"></div>
            </button>

            {compressedUrl && (
              <button
                onClick={downloadCompressed}
                className="flex-1 relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-2xl font-bold text-lg
                  hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl
                  transform hover:scale-105 group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Video
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform skew-x-12 transition-opacity duration-300"></div>
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