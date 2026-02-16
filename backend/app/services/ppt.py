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

# Theme configurations - Modern, visually appealing color schemes
THEMES = {
    "modern": {
        "bg_color": RGBColor(255, 255, 255),
        "title_color": RGBColor(99, 102, 241),  # Vibrant indigo
        "text_color": RGBColor(51, 65, 85),  # Slate gray
        "accent_color": RGBColor(249, 115, 22),  # Orange accent
        "gradient_colors": [(139, 92, 246), (59, 130, 246)],  # Purple to blue gradient
        "subtitle_color": RGBColor(100, 116, 139)
    },
    "minimal": {
        "bg_color": RGBColor(248, 250, 252),  # Soft gray
        "title_color": RGBColor(15, 23, 42),  # Deep slate
        "text_color": RGBColor(71, 85, 105),  # Medium slate
        "accent_color": RGBColor(16, 185, 129),  # Emerald green
        "gradient_colors": [(71, 85, 105), (100, 116, 139)],  # Gray gradient
        "subtitle_color": RGBColor(148, 163, 184)
    },
    "business": {
        "bg_color": RGBColor(255, 255, 255),
        "title_color": RGBColor(30, 58, 138),  # Deep blue
        "text_color": RGBColor(51, 65, 85),  # Professional gray
        "accent_color": RGBColor(220, 38, 38),  # Bold red accent
        "gradient_colors": [(30, 58, 138), (37, 99, 235)],  # Blue gradient
        "subtitle_color": RGBColor(71, 85, 105)
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
    
    prompt = f"""You are an expert presentation designer like gamma.ai. Analyze this content and create a visually engaging {slide_count}-slide presentation with VARIED content formats.

=== CONTENT TO ANALYZE ===
{text_sample}

=== CRITICAL INSTRUCTIONS ===
READ THE CONTENT ABOVE CAREFULLY. Extract MAXIMUM information from it.

DO NOT use generic phrases like:
- "Key Point 1, 2, 3"
- "Important concept"  
- "Supporting detail"

EXTRACT ACTUAL DETAILED INFORMATION:
- Specific concepts, processes, definitions FROM THE TEXT
- Facts, statistics, data, examples MENTIONED IN THE TEXT
- Formulas, equations, mathematical relationships (if applicable)
- Technical details, terminology, step-by-step explanations

HEADING REQUIREMENTS:
- Make each heading UNIQUE, DESCRIPTIVE, and ENGAGING
- Use ACTION WORDS: "Understanding...", "Exploring...", "Mastering...", "Building..."
- Include SPECIFIC TERMINOLOGY from the content
- Vary the heading style across slides

CONTENT FORMAT VARIETY (like gamma.ai):
Use DIFFERENT formats for different slides:

1. EXPLANATORY SLIDES: Use paragraph for context/definitions
   {{
     "heading": "Understanding the Concept",
     "paragraph": "Detailed explanation in 2-3 sentences that provides context and meaning...",
     "points": ["Supporting fact 1", "Supporting fact 2", "Supporting fact 3"]
   }}

2. LIST SLIDES: Pure bullet points for features/steps
   {{
     "heading": "Key Components",
     "points": ["Component 1: Description", "Component 2: Description", ...]
   }}

3. FORMULA/EQUATION SLIDES: For math/science content
   {{
     "heading": "Mathematical Foundation",
     "paragraph": "Brief explanation of what the formula represents...",
     "formula": "E = mc²" or "F = ma" or "x = (-b ± √(b²-4ac)) / 2a",
     "points": ["Variable 1: meaning", "Variable 2: meaning"]
   }}

4. PROCESS SLIDES: Flow diagrams
   {{
     "heading": "The Process Flow",
     "flow_diagram": true,
     "steps": ["Step 1", "Step 2", "Step 3"],
     "points": ["Context point 1", "Context point 2"]
   }}

5. COMPARISON SLIDES: Tables for structured data
   {{
     "heading": "Feature Comparison",
     "table_data": {{"headers": ["Aspect", "Details"], "rows": [["Row1", "Data1"], ["Row2", "Data2"]]}}
   }}

6. HIGHLIGHT SLIDES: Emphasize key statistics/quotes
   {{
     "heading": "Important Insight",
     "highlight": "70% improvement in accuracy",
     "paragraph": "This represents a major breakthrough because...",
     "points": ["Reason 1", "Reason 2"]
   }}

FORMULA DETECTION:
- If content mentions math, physics, chemistry, statistics → include formulas
- Format formulas clearly: "Area = πr²", "PV = nRT", "σ = √(Σ(x-μ)²/N)"
- Explain what each variable represents

Create EXACTLY {slide_count} slides with MIXED FORMATS:

1. Slide 1 (Title):
   - Extract the MAIN TOPIC from the text
   - Create informative subtitle
   - Provide descriptive image_keyword (FULL topic)

2. Slides 2-{slide_count-1} (Content slides - VARY THE FORMAT):
   - ALTERNATE between: Paragraph+Points, Pure Points, Formula+Explanation, Flow Diagram, Table
   - Create UNIQUE, ENGAGING heading
   - Add image_keyword for relevant images (e.g., "python logo", "tensorflow logo", "neural network diagram", "data science visualization")
   - For EXPLANATORY content: Add paragraph (2-3 sentences) + supporting points
   - For FORMULAS: Add formula + variable explanations
   - For PROCESSES: Add flow_diagram + steps
   - For COMPARISONS: Add table_data
   - For STATISTICS/KEY FACTS: Add highlight + context
   
3. Slide {slide_count} (Summary):
   - Unique heading based on content
   - Paragraph summarizing main insight
   - 3-5 comprehensive takeaways
   - Provide descriptive image_keyword

Return ONLY valid JSON (no markdown, no explanation):
{{
  "title": "[ACTUAL main topic from text]",
  "subtitle": "[What the content discusses in detail]",
  "slides": [
    {{
      "slide_type": "title",
      "heading": "[Actual topic - descriptive]",
      "subtitle": "[Actual description]",
      "image_keyword": "[FULL descriptive topic, e.g. 'artificial intelligence neural networks']"
    }},
    {{
      "slide_type": "content",
      "heading": "[UNIQUE engaging heading from text]",
      "image_keyword": "[Relevant logo/image like 'python logo', 'react logo', 'machine learning diagram', empty string if not applicable]",
      "paragraph": "[2-3 sentence explanation if explanatory slide]",
      "formula": "[Mathematical formula if applicable]",
      "highlight": "[Key statistic/fact if highlight slide]",
      "flow_diagram": false,
      "points": ["[Detailed fact 1]", "[Detailed fact 2]", "[Detailed fact 3]"],
      "table_data": null,
      "steps": null
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
                    retry_prompt = f"""STOP! You are giving generic, shallow responses.

I need you to READ THIS CONTENT and extract DETAILED, COMPREHENSIVE information:

{text_sample}

Create {slide_count} slides with UNIQUE, ENGAGING headings and VARIED, RICH content formats.

HEADING REQUIREMENTS:
- UNIQUE and DESCRIPTIVE (not "Key Point 1", "Overview", etc.)
- Use ACTION WORDS: "Understanding...", "Exploring...", "Mastering..."
- Include SPECIFIC TERMINOLOGY from content

CONTENT VARIETY (like gamma.ai):
- ALTERNATE formats: Paragraph+Points, Pure Points, Formula+Explanation, Flow Diagram, Table
- Add "paragraph" for explanatory content (2-3 sentences)
- Add "formula" for math/science content (e.g., "E = mc²", "F = ma")
- Add "highlight" for key statistics (e.g., "70% improvement")
- Add "flow_diagram: true" and "steps" array for processes
- Add "table_data" for comparisons

EXAMPLES:
1. Explanatory slide:
{{
  "heading": "Understanding the Core Concept",
  "paragraph": "This fundamental principle explains how the system operates at a deep level...",
  "points": ["Specific detail 1", "Specific detail 2", "Specific detail 3"]
}}

2. Formula slide:
{{
  "heading": "The Mathematical Foundation",
  "formula": "Area = πr²",
  "points": ["π (pi) ≈ 3.14159", "r represents radius", "Result in square units"]
}}

3. Highlight slide:
{{
  "heading": "Key Performance Metrics",
  "highlight": "85% accuracy achieved",
  "paragraph": "This represents a major breakthrough in the field...",
  "points": ["Tested on 10,000 samples", "Outperforms previous models"]
}}

4. Process flow slide:
{{
  "heading": "Understanding the Photosynthesis Cycle",
  "flow_diagram": true,
  "steps": ["Light absorption by chlorophyll", "Water splitting (photolysis)", "ATP generation", "Carbon fixation"],
  "points": ["Occurs in chloroplasts", "Produces oxygen as byproduct"]
}}

Return JSON with ACTUAL, DETAILED content from the text:"""
                    
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

def create_flow_diagram(slide, steps: list, theme: Dict, start_x: float = 1.5, start_y: float = 2.5):
    """Create a flow diagram with connected boxes for process steps."""
    try:
        from pptx.enum.shapes import MSO_SHAPE
        from pptx.util import Pt
        
        box_width = Inches(2.6)
        box_height = Inches(0.65)
        spacing = Inches(0.5)
        
        num_steps = len(steps[:5])  # Limit to 5 steps
        
        for i, step in enumerate(steps[:5]):
            # Skip empty steps
            if not step or not str(step).strip():
                continue
                
            # Calculate position (arrange vertically for better readability)
            x = Inches(start_x)
            y = Inches(start_y) + i * (box_height + spacing)
            
            # Create rounded rectangle shape
            shape = slide.shapes.add_shape(
                MSO_SHAPE.ROUNDED_RECTANGLE,
                x, y, box_width, box_height
            )
            
            # Style the box
            shape.fill.solid()
            shape.fill.fore_color.rgb = theme["accent_color"]
            shape.line.color.rgb = theme["title_color"]
            shape.line.width = Pt(2)
            
            # Add step number and text
            text_frame = shape.text_frame
            text_frame.text = f"{i+1}. {str(step).strip()}"
            text_frame.word_wrap = True
            text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE
            text_frame.margin_left = Inches(0.1)
            text_frame.margin_right = Inches(0.1)
            
            paragraph = text_frame.paragraphs[0]
            paragraph.font.size = Pt(13)
            paragraph.font.bold = True
            paragraph.font.color.rgb = RGBColor(255, 255, 255)
            paragraph.alignment = PP_ALIGN.CENTER
            
            # Add arrow to next step
            if i < num_steps - 1:
                # Arrow connector
                arrow_start_y = y + box_height
                arrow_end_y = y + box_height + spacing
                arrow_x = x + box_width / 2
                
                connector = slide.shapes.add_connector(
                    2,  # Straight connector
                    Inches(arrow_x), Inches(arrow_start_y),
                    Inches(arrow_x), Inches(arrow_end_y)
                )
                connector.line.color.rgb = theme["accent_color"]
                connector.line.width = Pt(3)
                
    except Exception as e:
        print(f"Error creating flow diagram: {e}")

def create_title_slide(prs: Presentation, slide_data: Dict, theme: Dict, include_images: bool = True):
    """Create a title slide with optional background image."""
    # Use blank layout (index 6 if available, otherwise use first available)
    try:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
    except IndexError:
        slide = prs.slides.add_slide(prs.slide_layouts[0])
    
    # Add background image if available
    if include_images and "image_keyword" in slide_data:
        img_data = fetch_relevant_image(slide_data["image_keyword"])
        if img_data:
            try:
                # Add as background with slight overlay
                left = Inches(0)
                top = Inches(0)
                slide.shapes.add_picture(img_data, left, top, width=Inches(10), height=Inches(7.5))
            except Exception as e:
                print(f"Error adding title slide background image: {e}")
    
    # Add semi-transparent overlay for text readability
    shape = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(2.2),
        Inches(10), Inches(3.2)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = RGBColor(0, 0, 0)
    shape.fill.transparency = 0.3
    shape.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(9), Inches(1.2))
    title_frame = title_box.text_frame
    title_frame.text = slide_data.get("heading", "Presentation Title")
    title_frame.word_wrap = True
    title_frame.vertical_anchor = MSO_ANCHOR.MIDDLE
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    title_frame.paragraphs[0].font.size = Pt(44)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    # Subtitle
    if "subtitle" in slide_data:
        subtitle_box = slide.shapes.add_textbox(Inches(0.5), Inches(3.9), Inches(9), Inches(1.0))
        subtitle_frame = subtitle_box.text_frame
        subtitle_frame.text = slide_data["subtitle"]
        subtitle_frame.word_wrap = True
        subtitle_frame.vertical_anchor = MSO_ANCHOR.TOP
        subtitle_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        subtitle_frame.paragraphs[0].font.size = Pt(20)
        subtitle_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
        subtitle_frame.paragraphs[0].font.italic = True

def create_content_slide(prs: Presentation, slide_data: Dict, theme: Dict, include_images: bool = True):
    """Create a content slide with varied content types (paragraphs, formulas, highlights, bullets)."""
    # Use blank layout (index 6 if available, otherwise use first available)
    try:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
    except IndexError:
        slide = prs.slides.add_slide(prs.slide_layouts[0])
    
    # Background
    background = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(0),
        Inches(10), Inches(7.5)
    )
    background.fill.solid()
    background.fill.fore_color.rgb = theme["bg_color"]
    background.line.fill.background()
    
    # Add small image/logo if image_keyword provided (for tech topics, logos, etc.)
    if include_images and "image_keyword" in slide_data and slide_data["image_keyword"]:
        img_data = fetch_relevant_image(slide_data["image_keyword"])
        if img_data:
            # Add small image in top-right corner
            try:
                slide.shapes.add_picture(
                    img_data, 
                    Inches(8.2), Inches(0.3), 
                    width=Inches(1.5)
                )
            except Exception as e:
                print(f"Error adding content slide image: {e}")
    
    # Title with accent line
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(7.5), Inches(0.7))
    title_frame = title_box.text_frame
    title_frame.text = slide_data.get("heading", "Slide Title")
    title_frame.word_wrap = True
    title_frame.vertical_anchor = MSO_ANCHOR.TOP
    title_frame.paragraphs[0].font.size = Pt(30)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = theme["title_color"]
    
    # Add decorative accent line under title
    accent_line = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0.5), Inches(1.05),
        Inches(1.8), Inches(0.05)
    )
    accent_line.fill.solid()
    accent_line.fill.fore_color.rgb = theme["accent_color"]
    accent_line.line.fill.background()
    
    # Check content type and layout
    has_flow_diagram = slide_data.get("flow_diagram", False)
    has_table = "table_data" in slide_data and slide_data.get("table_data")
    has_paragraph = "paragraph" in slide_data and slide_data.get("paragraph")
    has_formula = "formula" in slide_data and slide_data.get("formula")
    has_highlight = "highlight" in slide_data and slide_data.get("highlight")
    
    current_y = 1.5  # Starting Y position for content
    
    # Add flow diagram if specified
    if has_flow_diagram and "steps" in slide_data:
        steps = slide_data.get("steps", [])
        if steps:
            create_flow_diagram(slide, steps, theme, start_x=5.5, start_y=1.8)
        
        # Add supporting points on the left side
        points = slide_data.get("points", [])
        if points:
            content_box = slide.shapes.add_textbox(Inches(0.7), Inches(1.8), Inches(4.3), Inches(5.4))
            text_frame = content_box.text_frame
            text_frame.word_wrap = True
            text_frame.vertical_anchor = MSO_ANCHOR.TOP
            
            for i, point in enumerate(points[:5]):
                if point and str(point).strip():  # Validate point is not empty
                    p = text_frame.paragraphs[0] if i == 0 else text_frame.add_paragraph()
                    p.text = str(point).strip()
                    p.level = 0
                    p.font.size = Pt(15)
                    p.font.color.rgb = theme["text_color"]
                    p.space_before = Pt(6)
                    p.space_after = Pt(6)
                    p.line_spacing = 1.2
        return  # Skip regular content layout
    
    # Add highlight box if present (like gamma.ai key statistics)
    if has_highlight:
        highlight_box = slide.shapes.add_shape(
            1,  # Rectangle
            Inches(0.7), Inches(current_y),
            Inches(8.6), Inches(0.8)
        )
        highlight_box.fill.solid()
        highlight_box.fill.fore_color.rgb = theme["accent_color"]
        highlight_box.line.fill.background()
        
        # Add highlight text
        highlight_frame = highlight_box.text_frame
        highlight_frame.text = slide_data["highlight"]
        highlight_frame.word_wrap = True
        highlight_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        highlight_frame.paragraphs[0].font.size = Pt(26)
        highlight_frame.paragraphs[0].font.bold = True
        highlight_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
        highlight_frame.vertical_anchor = MSO_ANCHOR.MIDDLE
        
        current_y += 0.95
    
    # Add explanatory paragraph if present (like gamma.ai)
    if has_paragraph:
        para_box = slide.shapes.add_textbox(Inches(0.7), Inches(current_y), Inches(8.6), Inches(1.0))
        para_frame = para_box.text_frame
        para_frame.text = slide_data["paragraph"]
        para_frame.word_wrap = True
        para_frame.paragraphs[0].font.size = Pt(16)
        para_frame.paragraphs[0].font.color.rgb = theme["text_color"]
        para_frame.paragraphs[0].line_spacing = 1.3
        para_frame.paragraphs[0].space_after = Pt(8)
        
        current_y += 1.15
    
    # Add formula box if present (for math/science content)
    if has_formula:
        formula_box = slide.shapes.add_shape(
            1,  # Rectangle
            Inches(1.5), Inches(current_y),
            Inches(7), Inches(0.75)
        )
        formula_box.fill.solid()
        formula_box.fill.fore_color.rgb = RGBColor(248, 250, 252)  # Light gray background
        formula_box.line.color.rgb = theme["accent_color"]
        formula_box.line.width = Pt(2)
        
        # Add formula text
        formula_frame = formula_box.text_frame
        formula_frame.text = slide_data["formula"]
        formula_frame.word_wrap = True
        formula_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        formula_frame.paragraphs[0].font.size = Pt(24)
        formula_frame.paragraphs[0].font.bold = True
        formula_frame.paragraphs[0].font.color.rgb = theme["title_color"]
        # Use standard font instead of Cambria Math for compatibility
        try:
            formula_frame.paragraphs[0].font.name = 'Calibri'
        except:
            pass  # Use default font if Calibri not available
        formula_frame.vertical_anchor = MSO_ANCHOR.MIDDLE
        
        current_y += 0.9
    
    # Determine content layout based on what's present
    content_width = Inches(8.4)
    points = slide_data.get("points", [])
    
    # Adjust height and max points based on other elements
    if has_table:
        content_height = Inches(2.0)
        max_points = 3
    elif has_highlight or has_formula:
        content_height = Inches(7.5 - current_y - 0.2)
        max_points = 5
    elif has_paragraph:
        content_height = Inches(7.5 - current_y - 0.2)
        max_points = 6
    else:
        content_height = Inches(5.8)
        max_points = 8
    
    # Add bullet points if present
    if points and len(points) > 0:
        content_box = slide.shapes.add_textbox(Inches(0.7), Inches(current_y), content_width, content_height)
        text_frame = content_box.text_frame
        text_frame.word_wrap = True
        text_frame.vertical_anchor = MSO_ANCHOR.TOP
        
        for i, point in enumerate(points[:max_points]):
            if point and str(point).strip():  # Validate point is not empty
                p = text_frame.paragraphs[0] if i == 0 else text_frame.add_paragraph()
                p.text = str(point).strip()
                p.level = 0
                p.font.size = Pt(16)
                p.font.color.rgb = theme["text_color"]
                p.font.name = 'Calibri'
                p.space_before = Pt(7)
                p.space_after = Pt(7)
                p.line_spacing = 1.25
    
    # Add table if table_data is provided
    if has_table:
        try:
            table_data = slide_data["table_data"]
            headers = table_data.get("headers", [])
            rows = table_data.get("rows", [])
            
            if headers and rows:
                cols = len(headers)
                table_rows = len(rows) + 1  # +1 for header
                
                # Dynamic table positioning based on current_y
                table_y = max(current_y + 0.2, 4.5)
                table_height = min(Inches(2.5), Inches(7.5 - table_y - 0.2))
                
                table = slide.shapes.add_table(
                    table_rows, cols,
                    Inches(0.8), Inches(table_y),
                    Inches(8.4), table_height
                ).table
                
                # Set header row
                for col_idx, header in enumerate(headers):
                    cell = table.cell(0, col_idx)
                    cell.text = str(header) if header else ""
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = theme["accent_color"]
                    paragraph = cell.text_frame.paragraphs[0]
                    paragraph.font.bold = True
                    paragraph.font.size = Pt(13)
                    paragraph.font.color.rgb = RGBColor(255, 255, 255)
                    paragraph.alignment = PP_ALIGN.CENTER
                
                # Set data rows
                for row_idx, row_data in enumerate(rows, start=1):
                    if row_idx >= table_rows:  # Safety check
                        break
                    for col_idx, cell_value in enumerate(row_data):
                        if col_idx < cols:
                            cell = table.cell(row_idx, col_idx)
                            cell.text = str(cell_value) if cell_value is not None else ""
                            paragraph = cell.text_frame.paragraphs[0]
                            paragraph.font.size = Pt(11)
                            paragraph.font.color.rgb = theme["text_color"]
        except Exception as e:
            print(f"Error adding table: {e}")

def create_summary_slide(prs: Presentation, slide_data: Dict, theme: Dict, include_images: bool = True):
    """Create a summary/conclusion slide with optional background image."""
    # Use blank layout (index 6 if available, otherwise use first available)
    try:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
    except IndexError:
        slide = prs.slides.add_slide(prs.slide_layouts[0])
    
    # Add background image if available
    if include_images and "image_keyword" in slide_data:
        img_data = fetch_relevant_image(slide_data["image_keyword"])
        if img_data:
            try:
                slide.shapes.add_picture(img_data, Inches(0), Inches(0), width=Inches(10), height=Inches(7.5))
            except Exception as e:
                print(f"Error adding summary slide background image: {e}")
    
    # Gradient overlay for text readability
    background = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(0),
        Inches(10), Inches(7.5)
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(*theme["gradient_colors"][0])
    background.fill.transparency = 0.3 if include_images and "image_keyword" in slide_data else 0
    background.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(1), Inches(2.2), Inches(8), Inches(1.0))
    title_frame = title_box.text_frame
    title_frame.text = slide_data.get("heading", "Key Takeaways")
    title_frame.word_wrap = True
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    current_y = 3.4
    
    # Add summary paragraph if present
    if "paragraph" in slide_data and slide_data["paragraph"]:
        para_box = slide.shapes.add_textbox(Inches(1.2), Inches(current_y), Inches(7.6), Inches(0.8))
        para_frame = para_box.text_frame
        para_frame.text = slide_data["paragraph"]
        para_frame.word_wrap = True
        para_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        para_frame.paragraphs[0].font.size = Pt(16)
        para_frame.paragraphs[0].font.italic = True
        para_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
        para_frame.paragraphs[0].line_spacing = 1.3
        current_y += 0.95
    
    # Subtitle/summary points with better formatting
    if "points" in slide_data and slide_data["points"]:
        content_box = slide.shapes.add_textbox(Inches(1.2), Inches(current_y), Inches(7.6), Inches(7.5 - current_y - 0.2))
        text_frame = content_box.text_frame
        text_frame.word_wrap = True
        
        for i, point in enumerate(slide_data["points"][:5]):
            if point and str(point).strip():  # Validate point is not empty
                p = text_frame.paragraphs[0] if i == 0 else text_frame.add_paragraph()
                p.text = f"✓  {str(point).strip()}"  # Add checkmark for visual appeal
                p.alignment = PP_ALIGN.LEFT
                p.font.size = Pt(18)
                p.font.bold = True
                p.font.color.rgb = RGBColor(255, 255, 255)
                p.space_before = Pt(10)
                p.space_after = Pt(10)
                p.line_spacing = 1.25

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
    
    # Create presentation with proper settings
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # Verify we have slides to create
    if not structure.get("slides"):
        raise ValueError("No slides generated from content")
    
    # Create slides based on structure
    for slide_data in structure["slides"]:
        try:
            slide_type = slide_data.get("slide_type", "content")
            
            if slide_type == "title":
                create_title_slide(prs, slide_data, theme_config, include_images)
            elif slide_type == "summary":
                create_summary_slide(prs, slide_data, theme_config, include_images)
            else:  # content
                create_content_slide(prs, slide_data, theme_config, include_images)
        except Exception as e:
            print(f"Error creating slide {slide_data.get('heading', 'Unknown')}: {e}")
            # Continue with other slides even if one fails
            continue
    
    # Verify at least one slide was created
    if len(prs.slides) == 0:
        raise ValueError("Failed to create any slides")
    
    # Save presentation
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    import time
    filename = f"presentation_{int(time.time())}.pptx"
    filepath = temp_dir / filename
    
    # Save with error handling
    try:
        prs.save(str(filepath))
    except Exception as e:
        print(f"Error saving presentation: {e}")
        raise
    
    return str(filepath)
