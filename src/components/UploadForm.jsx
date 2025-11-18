import { useState, useEffect, useRef } from 'react'
import { useToast } from '../contexts/ToastContext'
import { apiClient } from '../utils/apiClient'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'

export default function UploadForm() {
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([]) // For multiple files from ZIP
  const [targetDuration, setTargetDuration] = useState(60)
  const [style, setStyle] = useState('cinematic')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const pollingIntervalRef = useRef(null)
  const { showToast } = useToast()

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const isVideo = selectedFile.type.startsWith('video/')
    const isZip = selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')
    
    if (!isVideo && !isZip) {
      showToast('Please upload a video file or ZIP file', 'error')
      return
    }

    setFile(selectedFile)

    // If ZIP, extract it client-side
    if (isZip) {
      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        const zipData = await selectedFile.arrayBuffer()
        const zipContents = await zip.loadAsync(zipData)
        
        const videoFiles = []
        for (const [filename, file] of Object.entries(zipContents.files)) {
          if (!file.dir && (filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.avi') || filename.endsWith('.mkv'))) {
            const blob = await file.async('blob')
            const videoFile = new File([blob], filename, { type: 'video/mp4' })
            videoFiles.push(videoFile)
          }
        }

        if (videoFiles.length === 0) {
          showToast('No video files found in ZIP', 'error')
          setFile(null)
          return
        }

        setFiles(videoFiles)
        showToast(`Found ${videoFiles.length} video file(s) in ZIP`, 'success')
      } catch (error) {
        console.error('Failed to extract ZIP:', error)
        showToast('Failed to extract ZIP file. Please upload individual video files.', 'error')
        setFile(null)
      }
    } else {
      // Single video file
      setFiles([selectedFile])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      showToast('Please select a file', 'error')
      return
    }

    setUploading(true)
    setProgress(0)
    setJobId(null)
    setJobStatus(null)
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      
      // Add all video files
      files.forEach((f) => {
        formData.append('files', f)
      })
      
      formData.append('target_duration', targetDuration.toString())
      if (style) {
        formData.append('style', style)
      }
      formData.append('formats', 'landscape') // Default to landscape for MVP

      const response = await apiClient.post('/api/v2/jobs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setProgress(Math.min(percentCompleted, 50)) // Upload is 0-50%
        },
      })

      const { job_id, status } = response.data
      setJobId(job_id)
      setJobStatus(status)
      setProgress(50) // Upload complete, now processing
      showToast('Upload successful! Processing video...', 'success')
      
      // Start polling for job status
      startPolling(job_id)
      
    } catch (error) {
      console.error('Upload error:', error)
      showToast(error.response?.data?.detail || error.message || 'Upload failed', 'error')
      setUploading(false)
      setProgress(0)
    }
  }

  const startPolling = (id) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiClient.get(`/api/v2/jobs/${id}/status`)
        const data = response.data
        
        setJobStatus(data.status)

        // Update progress from job progress if available
        if (data.progress) {
          const progressData = typeof data.progress === 'string' 
            ? JSON.parse(data.progress) 
            : data.progress
          if (progressData.percentage !== undefined) {
            setProgress(50 + (progressData.percentage / 2)) // Processing is 50-100%
          }
        }

        if (data.status === 'SUCCESS' || data.status === 'success' || data.status === 'completed') {
          clearInterval(pollingIntervalRef.current)
          setUploading(false)
          setProgress(100)
          showToast('Video processing complete!', 'success')
          
          // Get download URL - use the direct download endpoint
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          setDownloadUrl(`${baseUrl}/api/v2/jobs/${id}/download?format=landscape`)
        } else if (data.status === 'FAILED' || data.status === 'failed') {
          clearInterval(pollingIntervalRef.current)
          setUploading(false)
          showToast(data.error || 'Video processing failed', 'error')
        }
      } catch (error) {
        console.error('Failed to check job status:', error)
        // Don't stop polling on network errors, might be temporary
      }
    }, 2000) // Poll every 2 seconds
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        if (uploading) {
          showToast('Job is taking longer than expected. Check dashboard for status.', 'info')
          setUploading(false)
        }
      }
    }, 10 * 60 * 1000)
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8 rounded-2xl"
        >
          <h1 className="text-4xl font-display text-gradient-cosmic mb-2">
            Upload Clips
          </h1>
          <p className="text-pure-white/60 mb-8">
            Upload a ZIP file containing your raw gameplay clips
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm text-pure-white/80 mb-2">
                Video Clip
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cosmic-violet transition-colors">
                <input
                  type="file"
                  accept="video/*,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  {files.length > 0 ? (
                    <div>
                      <div className="text-cosmic-neon-cyan mb-2">
                        ✓ {files.length === 1 ? file.name : `${files.length} video file(s)`}
                      </div>
                      <div className="text-sm text-pure-white/60">
                        {files.length === 1 
                          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                          : `${files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024} MB total`
                        }
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-pure-white/80">
                        Click to select or drag and drop
                      </div>
                      <div className="text-sm text-pure-white/60 mt-2">
                        Video file or ZIP containing video clips
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-sm text-pure-white/80 mb-2">
                Target Duration: {targetDuration} seconds
              </label>
              <input
                type="range"
                min="30"
                max="300"
                value={targetDuration}
                onChange={(e) => setTargetDuration(Number(e.target.value))}
                className="w-full"
                disabled={uploading}
              />
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-sm text-pure-white/80 mb-2">
                Editing Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cosmic-violet focus:glow-neon transition-all text-pure-white"
                disabled={uploading}
              >
                <option value="cinematic">Cinematic</option>
                <option value="gaming">Gaming</option>
                <option value="energetic">Energetic</option>
                <option value="chill">Chill</option>
              </select>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div>
                <ProgressBar progress={progress} />
                <p className="text-sm text-pure-white/60 mt-2 text-center">
                  {progress < 50 ? 'Uploading...' : jobStatus ? `Processing... (${jobStatus})` : 'Processing video...'}
                </p>
                {jobId && (
                  <p className="text-xs text-pure-white/40 mt-1 text-center">
                    Job ID: {jobId}
                  </p>
                )}
              </div>
            )}

            {/* Download Link */}
            {downloadUrl && !uploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-cosmic-violet/20 border border-cosmic-violet/50 rounded-lg"
              >
                <p className="text-cosmic-neon-cyan mb-2 text-center">✨ Video Ready!</p>
                <a
                  href={downloadUrl}
                  download
                  className="block w-full px-6 py-3 bg-cosmic-violet hover:glow-neon rounded-lg font-semibold transition-all text-center"
                >
                  Download Highlight Video
                </a>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={files.length === 0 || uploading}
              className="w-full px-6 py-3 bg-cosmic-violet hover:glow-neon rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processing...' : `Generate Highlight Reel${files.length > 1 ? ` (${files.length} clips)` : ''}`}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

