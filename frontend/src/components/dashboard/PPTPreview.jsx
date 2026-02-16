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
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {slideStructure.title}
          </h3>
          {slideStructure.subtitle && (
            <p className="text-sm text-slate-600">{slideStructure.subtitle}</p>
          )}
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
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-700 uppercase">
                      {slide.slide_type}
                    </span>
                    {slide.image_keyword && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                      </span>
                    )}
                    {slide.paragraph && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Paragraph
                      </span>
                    )}
                    {slide.formula && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-100 text-cyan-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Formula
                      </span>
                    )}
                    {slide.highlight && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-100 text-yellow-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Highlight
                      </span>
                    )}
                    {slide.flow_diagram && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Flow Diagram
                      </span>
                    )}
                    {slide.table_data && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Table
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

                  {slide.highlight && (
                    <div className="mb-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border-2 border-yellow-300">
                      <p className="text-lg font-bold text-orange-800 text-center">
                        {slide.highlight}
                      </p>
                    </div>
                  )}

                  {slide.paragraph && (
                    <div className="mb-3 bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm text-indigo-900 leading-relaxed italic">
                        "{slide.paragraph}"
                      </p>
                    </div>
                  )}

                  {slide.formula && (
                    <div className="mb-3 bg-cyan-50 rounded-lg p-4 border-2 border-cyan-300">
                      <p className="text-xs font-semibold text-cyan-700 mb-1">Formula:</p>
                      <p className="text-xl font-bold text-cyan-900 text-center font-mono">
                        {slide.formula}
                      </p>
                    </div>
                  )}

                  {slide.flow_diagram && slide.steps && slide.steps.length > 0 && (
                    <div className="mb-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-700 mb-2">Process Flow:</p>
                      <ol className="space-y-1">
                        {slide.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-purple-900">
                            <span className="font-bold">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {slide.points && slide.points.length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {slide.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {slide.table_data && (
                    <div className="mt-2 bg-green-50 rounded-lg p-2 border border-green-200">
                      <p className="text-xs font-semibold text-green-700 mb-1">
                        Table: {slide.table_data.headers?.join(' | ')}
                      </p>
                      <p className="text-xs text-green-600">
                        {slide.table_data.rows?.length || 0} rows
                      </p>
                    </div>
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
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• Download as PPTX file</li>
          <li>• Compatible with PowerPoint, Google Slides, Keynote</li>
          <li>• Editable content and styling</li>
        </ul>
      </div>
    </div>
  )
}

export default PPTPreview
