STRICT RULES (MANDATORY):
- Do ONLY what is explicitly instructed
- Do NOT create extra files or folders
- Do NOT add API keys, secrets, or environment variables
- Do NOT add sample credentials
- Do NOT add extra comments or explanations
- Update ONLY the files mentioned
- Maintain clean architecture
- Assume Windows 11 environment
- Do NOT optimize or extend functionality
- Create and update ONLY ONE README.md 
Make sure no secret keys are included in the README.md or anyother files use that from .env nothing such should be pushed on github

Before writing any frontend code, carefully inspect the backend folder.

Your task:
1. Read backend/app/main.py
2. Read backend/app/routes/*
3. Read backend/app/services/*
4. Identify:
   - Available API endpoints
   - Request payloads
   - Response formats
   - Authentication requirements
   - Content flow (upload → normalize → generate)

Rules:
- Do NOT assume APIs that do not exist
- Do NOT invent response structures
- Frontend must strictly follow backend contracts
- If a feature is not implemented in backend, create UI placeholder only

After understanding backend:
- Build frontend components that correctly integrate with existing logic
