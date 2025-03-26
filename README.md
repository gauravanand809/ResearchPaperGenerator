# Research Paper Generator

An AI-powered tool that generates comprehensive academic research papers based on a given topic.

## Features

- Generates full academic research papers with proper formatting
- Includes abstract, introduction, literature review, methodology, results, and discussion sections
- Creates citations and references in academic format
- Supports custom output formats (Markdown, HTML, PDF)
- Multiple AI model support with automatic fallbacks

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd research-paper-generator

# Install dependencies
npm install
```

## Configuration

Create a `.env` file with the following variables:

```
OPENROUTER_API_KEY=your-api-key
DEFAULT_MODEL=deepseek/deepseek-chat-v3-0324:free
OUTPUT_DIR=/path/to/output/directory
DEBUG=false
```

## Usage

### Command Line

Generate a paper by running:

```bash
npm start
```

With options:

```bash
npm start -- --topic "AI in Healthcare" --output ~/Documents --iterations 3
```

### CLI Options

- `-t, --topic <topic>`: Research topic
- `-o, --output <directory>`: Output directory
- `-i, --iterations <number>`: Number of refinement iterations (default: 2)
- `-m, --model <model>`: LLM model to use
- `--no-pdf`: Skip PDF generation
- `--no-html`: Skip HTML generation

## Customization

You can customize generation parameters by creating a `paper-config.json` file:

```json
{
  "initialDraftTemperature": 0.7,
  "refinementTemperature": 0.5,
  "maxTokens": 8000,
  "paperSettings": {
    "minWordCount": 7000,
    "recommendedWordCount": 10000,
    "minCitations": 75
  }
}
```

## License

MIT
