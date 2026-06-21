@echo off
echo Creating virtual environment (if it doesn't exist)...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install --upgrade streamlit langchain langchain-community langchain-core langchain-classic langchain-google-genai python-dotenv

echo Starting AI Interview Coach...
set GOOGLE_API_KEY=AIzaSyDqYNORQr12hHq5JLCdJBsaF3apaHkZfIY
python -m streamlit run actions\app.py
pause