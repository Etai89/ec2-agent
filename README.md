# ec2-agent

This project implements an OpenAI-based agent designed to help users send files to Etai through a controlled approval workflow. The agent collects file details from the user, requests approval from Etai over WhatsApp, and upon receiving approval uploads the file to an EC2 instance. After uploading, the agent generates a simple summary of the file and sends Etai a download link along with the summary.

## Features

- Interactive conversation with a user to determine intent and collect file details.
- Sends an approval request to Etai over WhatsApp using the Twilio API.
- Waits for Etai's approval before proceeding to file upload.
- Uploads files to an EC2 instance into a new subfolder of `uploads` and stores a summary text file next to the uploaded file.
- Generates a simple textual summary of the uploaded file.
- Sends Etai a download link to the uploaded file along with the summary once processing is complete.

## Getting Started

1. **Install dependencies**: See `requirements.txt` for the Python packages required to run the agent.
2. **Configure environment variables**: The agent expects a number of environment variables to be set so it can talk to Twilio and the EC2 instance. See the `Configuration` section below.
3. **Run the agent**: Execute `python main.py` to start an interactive session. The agent will prompt you for input and walk you through the file‑sending workflow.

## Configuration

The agent is controlled via environment variables. You can set these directly in your shell or place them in a `.env` file and load them before running the script.

- `TWILIO_ACCOUNT_SID` – Your Twilio account SID.
- `TWILIO_AUTH_TOKEN` – Your Twilio auth token.
- `TWILIO_WHATSAPP_FROM` – The Twilio WhatsApp sender number (e.g. `whatsapp:+14155238886`).
- `ETAI_WHATSAPP_TO` – The recipient WhatsApp number for Etai (e.g. `whatsapp:+972XXXXXXXXX`).
- `EC2_HOST` – The hostname or IP address of the EC2 instance (e.g. `ec2-1-2-3-4.compute-1.amazonaws.com`).
- `EC2_USERNAME` – The SSH username used to connect to the EC2 instance.
- `EC2_KEY_FILE` – Path to the private SSH key file used to authenticate.
- `EC2_BASE_URL` – Base URL of the EC2 instance for downloading files (e.g. `https://my-ec2-app.example.com/uploads`).

## Disclaimer

The code provided in this project is a skeleton implementation intended to illustrate the flow of an approval‑driven file upload using WhatsApp and EC2. It omits robust error handling and assumes that environment variables are set correctly. Additional validation, security hardening, and production‑ready error handling should be added before deploying this agent in a real environment.
