from groq import Groq
import os
import json
import re
import requests
from io import BytesIO
from pathlib import Path
from typing import List, Dict, Optional
from dotenv import load_dotenv
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from PIL import Image

load_dotenv()

# Theme configurations
THEMES = {
    "modern": {
        "bg_color": RGBColor(255, 255, 255),
        "title_color": RGBColor(26, 35, 126),  # Deep blue
        "text_color": RGBColor(66, 66, 66),
        "accent_color": RGBColor(63, 81, 181),  # Indigo
        "gradient_colors": [(63, 81, 181), (100, 149, 237)]  # Blue gradient
    },
    "minimal": {
        "bg_color": RGBColor(250, 250, 250),
        "title_color": RGBColor(33, 33, 33),
        "text_color": RGBColor(97, 97, 97),
        "accent_color": RGBColor(74, 144, 226),
        "gradient_colors": [(240, 240, 240), (255, 255, 255)]
    },
    "business": {
        "bg_color": RGBColor(255, 255, 255),
        "title_color": RGBColor(13, 71, 161),  # Navy blue
        "text_color": RGBColor(55, 71, 79),    # Blue grey
        "accent_color": RGBColor(1, 87, 155),  # Light blue
        "gradient_colors": [(21, 101, 192), (33, 150, 243)]
    }
}

def clean_json_response(text: str) -> str:
    """Extract JSON from markdown code blocks."""
    text = text.strip()
    
    if text.startswith('```'):
        first_newline = text.find('\n')
        if first_newline != -1:
            text = text[first_newline + 1:]
        else:
            text = text[3:]
    
    if text.endswith('```'):
        text = text[:-3]
    
    text = text.strip()
    
    if '{' in text and '}' in text:
        start = text.find('{')
        brace_count = 0
        end = -1
        for i in range(start, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        
        if end != -1:
            text = text[start:end]
    
    return text

def analyze_content_for_slides(normalized_text: str, slide_count: int = 10) -> Dict:
    """Use Groq to structure content into slides with visual suggestions."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    
    client = Groq(api_key=api_key)
    
    # Smart content extraction - get key sections
    if len(normalized_text) > 5000:
        # Take beginning (context), middle (core content), and end (conclusion)
        beginning = normalized_text[:1500]
        middle_start = len(normalized_text) // 2 - 750
        middle = normalized_text[middle_start:middle_start + 1500]
        end = normalized_text[-1500:]
        text_sample = f"{beginning}\n\n[...content continues...]\n\n{middle}\n\n[...content continues...]\n\n{end}"
    else:
        text_sample = normalized_text
    
    prompt = f"""You are an expert presentation designer. Analyze this content and create a professional {slide_count}-slide presentation.

=== CONTENT TO ANALYZE ===
{text_sample}

=== CRITICAL INSTRUCTIONS ===
READ THE CONTENT ABOVE CAREFULLY. Extract REAL information from it.

DO NOT use generic phrases like:
- "Key Point 1, 2, 3"
- "Important concept"
- "Supporting detail"
- "Conclusion"

INSTEAD, extract ACTUAL:
- Topics discussed IN THE TEXT
- Facts, data, names, concepts FROM THE TEXT
- Specific details MENTIONED IN THE TEXT

Create EXACTLY {slide_count} slides:

1. Slide 1 (Title): 
   - Extract the MAIN TOPIC from the text
   - Create subtitle based on what the content is about

2. Slides 2-{slide_count-1} (Content slides):
   - Each slide = ONE key concept/section FROM THE TEXT
   - Extract 3-5 SPECIFIC bullet points from that section
   - Use actual terminology, numbers, names from the content
   - Choose image keywords that match the ACTUAL topic

3. Slide {slide_count} (Summary):
   - List 2-3 main takeaways FROM THE CONTENT
   - Use specific terms from the text

EXAMPLE OF GOOD vs BAD:
❌ BAD: "Key Point 1" → "Important concept"
✅ GOOD: "Machine Learning Basics" → "Supervised learning uses labeled data for training"

Return ONLY valid JSON (no markdown, no explanation):
{{
  "title": "[ACTUAL main topic from text]",
  "subtitle": "[What the content discusses]",
  "slides": [
    {{
      "slide_type": "title",
      "heading": "[Actual topic]",
      "subtitle": "[Actual description]",
      "image_keyword": "[topic keyword]"
    }},
    {{
      "slide_type": "content",
      "heading": "[Specific concept from text]",
      "points": ["[Actual fact 1]", "[Actual fact 2]", "[Actual fact 3]"],
      "image_keyword": "[matches heading]"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=4000
        )
        
        result = response.choices[0].message.content
        print(f"AI Response: {result[:500]}...")  # Debug: see what AI returns
        
        cleaned = clean_json_response(result)
        structure = json.loads(cleaned)
        
        # Validate that we got actual content, not generic
        if structure.get("slides"):
            first_content_slide = next((s for s in structure["slides"] if s.get("slide_type") == "content"), None)
            if first_content_slide:
                heading = first_content_slide.get("heading", "").lower()
                points = first_content_slide.get("points", [])
                
                # Check if it's generic content
                generic_terms = ["key point", "important concept", "supporting detail", "conclusion"]
                is_generic = any(term in heading for term in generic_terms)
                if points:
                    is_generic = is_generic or any(term in str(points).lower() for term in generic_terms)
                
                if is_generic:
                    print("WARNING: AI returned generic content. Retrying with stronger prompt...")
                    # Retry once with even more explicit instructions
                    retry_prompt = f"""STOP! You are giving generic responses.

I need you to READ THIS CONTENT and extract REAL information:

{text_sample}

Create {slide_count} slides. Each slide must have:
- A heading that describes an ACTUAL topic from the text above
- Bullet points with REAL facts/data/concepts from the text

DO NOT write:
- "Key Point 1/2/3"
- "Important concept"
- "Supporting detail"

Write ACTUAL content like:
- "Photosynthesis Process" → "Plants convert CO2 and H2O into glucose using sunlight"
- "Python Functions" → "Functions are defined with the 'def' keyword"

Now create the presentation with REAL content from the text. Return JSON only:"""
                    
                    response = client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[{"role": "user", "content": retry_prompt}],
                        temperature=0.2,
                        max_tokens=4000
                    )
                    result = response.choices[0].message.content
                    cleaned = clean_json_response(result)
                    structure = json.loads(cleaned)
        
        # Trim to exact slide count if needed
        if len(structure.get("slides", [])) > slide_count:
            structure["slides"] = structure["slides"][:slide_count]
        
        return structure
    
    except Exception as e:
        print(f"Error in analyze_content_for_slides: {str(e)}")
        # Return minimal structure with error info
        raise ValueError(f"Failed to generate presentation structure: {str(e)}")

def fetch_image_unsplash(keyword: str) -> Optional[BytesIO]:
    """Fetch image from Unsplash API."""
    api_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not api_key:
        return None
    
    try:
        url = "https://api.unsplash.com/photos/random"
        params = {
            "query": keyword,
            "orientation": "landscape",
            "client_id": api_key
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            image_url = data["urls"]["regular"]  # 1080px width
            
            img_response = requests.get(image_url, timeout=10)
            if img_response.status_code == 200:
                return BytesIO(img_response.content)
    except Exception as e:
        print(f"Unsplash fetch error: {e}")
    
    return None

def fetch_image_pexels(keyword: str) -> Optional[BytesIO]:
    """Fetch image from Pexels API."""
    api_key = os.getenv("PEXELS_API_KEY")
    if not api_key:
        return None
    
    try:
        url = "https://api.pexels.com/v1/search"
        headers = {"Authorization": api_key}
        params = {
            "query": keyword,
            "per_page": 1,
            "orientation": "landscape"
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data["photos"]:
                image_url = data["photos"][0]["src"]["large"]  # 940px width
                
                img_response = requests.get(image_url, timeout=10)
                if img_response.status_code == 200:
                    return BytesIO(img_response.content)
    except Exception as e:
        print(f"Pexels fetch error: {e}")
    
    return None

def fetch_relevant_image(keyword: str) -> Optional[BytesIO]:
    """Try to fetch image from Unsplash first, then Pexels."""
    # Try Unsplash first
    img = fetch_image_unsplash(keyword)
    if img:
        return img
    
    # Fallback to Pexels
    img = fetch_image_pexels(keyword)
    if img:
        return img
    
    return None

def resize_image_for_slide(image_stream: BytesIO, max_width: int = 8, max_height: int = 6) -> BytesIO:
    """Resize image to fit slide dimensions while maintaining aspect ratio."""
    try:
        img = Image.open(image_stream)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Calculate resize dimensions in inches (convert to pixels at 96 DPI)
        max_width_px = int(max_width * 96)
        max_height_px = int(max_height * 96)
        
        # Resize maintaining aspect ratio
        img.thumbnail((max_width_px, max_height_px), Image.Resampling.LANCZOS)
        
        # Save to BytesIO
        output = BytesIO()
        img.save(output, format='JPEG', quality=85)
        output.seek(0)
        
        return output
    except Exception as e:
        print(f"Image resize error: {e}")
        return image_stream

def create_title_slide(prs: Presentation, slide_data: Dict, theme: Dict, include_images: bool = True):
    """Create a title slide with optional background image."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
    
    # Add background image if available
    if include_images and "image_keyword" in slide_data:
        img_data = fetch_relevant_image(slide_data["image_keyword"])
        if img_data:
            # Add as background with slight overlay
            left = Inches(0)
            top = Inches(0)
            slide.shapes.add_picture(img_data, left, top, width=Inches(10), height=Inches(7.5))
    
    # Add semi-transparent overlay for text readability
    shape = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(2.5),
        Inches(10), Inches(2.5)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = RGBColor(0, 0, 0)
    shape.fill.transparency = 0.3
    shape.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.8), Inches(9), Inches(1.2))
    title_frame = title_box.text_frame
    title_frame.text = slide_data.get("heading", "Presentation Title")
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    title_frame.paragraphs[0].font.size = Pt(54)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    # Subtitle
    if "subtitle" in slide_data:
        subtitle_box = slide.shapes.add_textbox(Inches(0.5), Inches(4.2), Inches(9), Inches(0.8))
        subtitle_frame = subtitle_box.text_frame
        subtitle_frame.text = slide_data["subtitle"]
        subtitle_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        subtitle_frame.paragraphs[0].font.size = Pt(24)
        subtitle_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)

def create_content_slide(prs: Presentation, slide_data: Dict, theme: Dict, include_images: bool = True):
    """Create a content slide with text and side image."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
    
    # Background
    background = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(0),
        Inches(10), Inches(7.5)
    )
    background.fill.solid()
    background.fill.fore_color.rgb = theme["bg_color"]
    background.line.fill.background()
    
    # Image on right side if available
    image_added = False
    if include_images and "image_keyword" in slide_data:
        img_data = fetch_relevant_image(slide_data["image_keyword"])
        if img_data:
            try:
                resized_img = resize_image_for_slide(img_data, max_width=4, max_height=5.5)
                slide.shapes.add_picture(resized_img, Inches(5.5), Inches(1.2), height=Inches(5.5))
                image_added = True
            except Exception as e:
                print(f"Error adding image: {e}")
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.8))
    title_frame = title_box.text_frame
    title_frame.text = slide_data.get("heading", "Slide Title")
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = theme["title_color"]
    
    # Content area width depends on whether image was added
    content_width = Inches(4.5) if image_added else Inches(9)
    
    # Bullet points
    content_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), content_width, Inches(5))
    text_frame = content_box.text_frame
    text_frame.word_wrap = True
    text_frame.vertical_anchor = MSO_ANCHOR.TOP
    
    points = slide_data.get("points", ["Key point 1", "Key point 2", "Key point 3"])
    for i, point in enumerate(points[:5]):  # Max 5 points
        p = text_frame.paragraphs[0] if i == 0 else text_frame.add_paragraph()
        p.text = point
        p.level = 0
        p.font.size = Pt(20)
        p.font.color.rgb = theme["text_color"]
        p.space_before = Pt(12)
        p.space_after = Pt(12)

def create_summary_slide(prs: Presentation, slide_data: Dict, theme: Dict, include_images: bool = True):
    """Create a summary/conclusion slide."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
    
    # Gradient background
    background = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(0),
        Inches(10), Inches(7.5)
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(*theme["gradient_colors"][0])
    background.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(1), Inches(2.5), Inches(8), Inches(1.5))
    title_frame = title_box.text_frame
    title_frame.text = slide_data.get("heading", "Thank You")
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    title_frame.paragraphs[0].font.size = Pt(54)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    # Subtitle/summary points
    if "points" in slide_data:
        content_box = slide.shapes.add_textbox(Inches(2), Inches(4.2), Inches(6), Inches(2))
        text_frame = content_box.text_frame
        text_frame.word_wrap = True
        
        for i, point in enumerate(slide_data["points"][:3]):
            p = text_frame.paragraphs[0] if i == 0 else text_frame.add_paragraph()
            p.text = point
            p.alignment = PP_ALIGN.CENTER
            p.font.size = Pt(18)
            p.font.color.rgb = RGBColor(255, 255, 255)
            p.space_before = Pt(8)

def generate_presentation(
    normalized_text: str,
    slide_count: int = 10,
    theme: str = "modern",
    include_images: bool = True
) -> str:
    """Generate complete presentation and return file path."""
    
    # Analyze content and create slide structure
    structure = analyze_content_for_slides(normalized_text, slide_count)
    
    # Get theme
    theme_config = THEMES.get(theme, THEMES["modern"])
    
    # Create presentation
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # Create slides based on structure
    for slide_data in structure["slides"]:
        slide_type = slide_data.get("slide_type", "content")
        
        if slide_type == "title":
            create_title_slide(prs, slide_data, theme_config, include_images)
        elif slide_type == "summary":
            create_summary_slide(prs, slide_data, theme_config, include_images)
        else:  # content
            create_content_slide(prs, slide_data, theme_config, include_images)
    
    # Save presentation
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    import time
    filename = f"presentation_{int(time.time())}.pptx"
    filepath = temp_dir / filename
    
    prs.save(str(filepath))
    
    return str(filepath)
