import React from 'react'

function PPTPreview({ resultData, onClose }) {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token')
      const downloadUrl = resultData.download_url
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `presentation_${resultData.content_id}.pptx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Download failed. Please try again.')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed. Please try again.')
    }
  }

  const slideStructure = resultData.slide_structure

  if (!slideStructure) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-8 text-center">
        <p className="text-slate-600">No presentation data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Download Button */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {slideStructure.title}
            </h3>
            {slideStructure.subtitle && (
              <p className="text-sm text-slate-600">{slideStructure.subtitle}</p>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PPTX
          </button>
        </div>

        {/* Presentation Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/70 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-slate-600 mb-1">Slides</p>
            <p className="text-lg font-bold text-slate-900">{slideStructure.slides?.length || 0}</p>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-slate-600 mb-1">Theme</p>
            <p className="text-lg font-bold text-slate-900 capitalize">{resultData.options?.theme || 'Modern'}</p>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-slate-600 mb-1">Images</p>
            <p className="text-lg font-bold text-slate-900">{resultData.options?.include_images ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Slide Preview */}
      <div className="bg-white border-2 border-orange-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Slide Preview
        </h4>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {slideStructure.slides?.map((slide, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* Slide Number */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                {/* Slide Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-700 uppercase">
                      {slide.slide_type}
                    </span>
                    {slide.image_keyword && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {slide.image_keyword}
                      </span>
                    )}
                  </div>

                  <h5 className="text-base font-bold text-slate-900 mb-2">
                    {slide.heading}
                  </h5>

                  {slide.subtitle && (
                    <p className="text-sm text-slate-600 mb-2 italic">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.points && slide.points.length > 0 && (
                    <ul className="space-y-1">
                      {slide.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Presentation
        </button>

        <button
          onClick={onClose}
          className="px-4 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate New
        </button>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-slate-700 font-semibold mb-1">
              💡 Your Presentation is Ready!
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Click "Download Presentation" to save the PPTX file</li>
              <li>• Open with Microsoft PowerPoint, Google Slides, or Keynote</li>
              <li>• Fully editable - customize colors, fonts, images, and content</li>
              <li>• All images are from free stock photo APIs (Unsplash/Pexels)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PPTPreview
