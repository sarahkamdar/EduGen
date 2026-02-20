import React from 'react'

const getSlideLabel = (slide) => {
  if (slide.slide_type === 'title') return 'Title'
  if (slide.slide_type === 'section') return 'Section'
  if (slide.formula) return 'Formula'
  if (slide.flow_diagram) return 'Flow'
  if (slide.table_data) return 'Table'
  if (slide.image_keyword) return 'Image'
  if (slide.paragraph) return 'Quote'
  return 'Content'
}

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
      <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8 text-center">
        <p className="text-[#6B7280] text-sm">No presentation data available</p>
      </div>
    )
  }

  const slideCount = slideStructure.slides?.length || 0

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div
        className="rounded-[12px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
          backgroundSize: '22px 22px, cover',
          boxShadow: '0 4px 24px rgba(30,58,138,0.18)',
        }}
      >
        <div className="px-6 pt-6 pb-5">
          {/* Presentation icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-[10px] bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight mb-0.5">
                {slideStructure.title}
              </h3>
              {slideStructure.subtitle && (
                <p className="text-sm text-blue-200">{slideStructure.subtitle}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
              <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Slides</p>
              <p className="text-xl font-bold text-white">{slideCount}</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
              <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Theme</p>
              <p className="text-sm font-semibold text-white capitalize">{resultData.options?.theme || 'Modern'}</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
              <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Images</p>
              <p className="text-sm font-semibold text-white">{resultData.options?.include_images ? '✓ Yes' : '✗ No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Preview */}
      <div className="bg-white border border-[#C7D2FE] rounded-[12px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(99,102,241,0.07)' }}>
        <div className="px-5 py-3.5 border-b border-[#EEF2FF] flex items-center gap-2" style={{ backgroundColor: '#F8F9FF' }}>
          <span className="w-2 h-2 rounded-full bg-[#6366F1]"></span>
          <h4 className="text-sm font-semibold text-[#1E1B4B]">Slide Preview</h4>
          <span className="ml-auto text-xs text-[#9CA3AF]">{slideCount} slides</span>
        </div>

        <div className="space-y-2.5 max-h-[560px] overflow-y-auto p-4">
          {slideStructure.slides?.map((slide, index) => (
            <div
              key={index}
              className="rounded-[10px] overflow-hidden border border-[#C7D2FE] hover:border-[#A5B4FC] transition-all bg-white"
            >
              {/* Slide header strip */}
              <div className="px-4 py-2 flex items-center gap-2.5 bg-[#EEF2FF] border-b border-[#C7D2FE]">
                <div className="w-6 h-6 rounded-[5px] bg-[#1E3A8A] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <h5 className="text-sm font-semibold flex-1 truncate text-[#1E1B4B]">
                  {slide.heading}
                </h5>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white text-[#1E3A8A] border border-[#A5B4FC]">
                    {getSlideLabel(slide)}
                  </span>
                  {slide.image_keyword && slide.slide_type !== 'image' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#6B7280] border border-[#D1D5DB]">Img</span>
                  )}
                  {slide.formula && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#6B7280] border border-[#D1D5DB]">Fx</span>
                  )}
                  {slide.table_data && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#6B7280] border border-[#D1D5DB]">Tbl</span>
                  )}
                </div>
              </div>

              {/* Slide body */}
              <div className="px-4 py-3">
                {slide.subtitle && (
                  <p className="text-xs text-[#6B7280] mb-2 italic">{slide.subtitle}</p>
                )}

                {slide.highlight && (
                  <div className="mb-2 bg-[#EEF2FF] rounded-[7px] px-3 py-2 border border-[#C7D2FE]">
                    <p className="text-sm font-semibold text-center text-[#1E3A8A]">{slide.highlight}</p>
                  </div>
                )}

                {slide.paragraph && (
                  <div className="mb-2 bg-[#F9FAFB] rounded-[7px] px-3 py-2 border border-[#E5E7EB]">
                    <p className="text-xs text-[#374151] leading-relaxed italic">"{slide.paragraph}"</p>
                  </div>
                )}

                {slide.formula && (
                  <div className="mb-2 bg-[#F9FAFB] rounded-[7px] px-3 py-2.5 border border-[#E5E7EB] text-center">
                    <p className="text-[10px] font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">Formula</p>
                    <p className="text-base font-mono font-bold text-[#111827]">{slide.formula}</p>
                  </div>
                )}

                {slide.flow_diagram && slide.steps && slide.steps.length > 0 && (
                  <div className="mb-2 bg-[#F9FAFB] rounded-[7px] px-3 py-2 border border-[#E5E7EB]">
                    <p className="text-[10px] font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Process Flow</p>
                    <div className="flex flex-wrap gap-1 items-center">
                      {slide.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span className="text-[10px] bg-white border border-[#C7D2FE] text-[#1E3A8A] px-2 py-0.5 rounded-full font-medium">{step}</span>
                          {idx < slide.steps.length - 1 && <span className="text-[#9CA3AF] text-xs">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {slide.points && slide.points.length > 0 && (
                  <ul className="space-y-1">
                    {slide.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#374151]">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#1E3A8A] flex-shrink-0"></span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {slide.table_data && (
                  <div className="mt-1 bg-[#F9FAFB] rounded-[7px] px-3 py-2 border border-[#E5E7EB]">
                    <p className="text-[10px] font-semibold text-[#6B7280] mb-0.5 uppercase tracking-wide">Table · {slide.table_data.headers?.join(' / ')}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{slide.table_data.rows?.length || 0} rows</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="px-4 py-2.5 text-white rounded-[10px] text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow"
          style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .pptx
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2.5 border-2 border-[#C7D2FE] text-[#1E3A8A] bg-[#EEF2FF] rounded-[10px] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate New
        </button>
      </div>

      {/* Info note */}
      <div className="bg-[#EFF6FF] border border-[#BAE0FD] rounded-[10px] px-4 py-3 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <ul className="text-xs text-[#1E40AF] space-y-0.5">
          <li>Compatible with PowerPoint, Google Slides, and Keynote</li>
          <li>All content and styling is fully editable after download</li>
        </ul>
      </div>
    </div>
  )
}

export default PPTPreview
