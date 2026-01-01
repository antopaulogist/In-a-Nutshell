# In a Nutshell

A Next.js web application that generates concise, structured summaries of any topic using OpenAI. Get the short, useful version of anything — fast, clear, and with good judgement.

## Features

- **AI-Powered Summaries**: Uses OpenAI to generate structured summaries
- **Three-Section Format**:
  - **In a Nutshell**: 3-5 sentence overview
  - **The Essentials**: 10 ranked items with details
  - **Why it Matters**: One-sentence reflection
- **Neo-Brutalist Design**: Bold typography, thick borders, vibrant colors
- **Copy to Clipboard**: Easy sharing of generated content

## Prerequisites

- Node.js 18+ and npm
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/antopaulogist/In-a-Nutshell.git
cd In-a-Nutshell
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important**: Never commit your `.env.local` file. It's already in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Usage

1. Enter any topic in the input field (e.g., "quantum computing", "The Beatles", "existentialism")
2. Click "GENERATE" or press Enter
3. Wait for the AI to generate the summary
4. Use "COPY TEXT" to copy the result
5. Use "CLEAR / NEW" to start over

## Configuration

### Model Selection

The app uses `gpt-4.1-mini` by default. If this model is not available in your OpenAI account, you can change it in `src/app/api/generate/route.js` (line 180) to:

- `gpt-4o-mini` (recommended, fast and cheap)
- `gpt-4-turbo` (more capable)
- `gpt-4` (standard)

## Tech Stack

- **Next.js 16.1.1** - React framework
- **React 19.2.3** - UI library
- **OpenAI SDK 6.15.0** - AI integration
- **Custom Fonts**: Unbounded (headings), Space Mono (body)

## Project Structure

```
├── src/
│   └── app/
│       ├── api/
│       │   └── generate/
│       │       └── route.js      # API endpoint for OpenAI
│       ├── page.js                # Main UI component
│       ├── layout.js              # Root layout
│       └── globals.css            # Global styles
├── .env.example                   # Environment variables template
└── README.md
```

## Security Notes

- API keys are stored in environment variables and never committed to git
- All API calls are server-side only
- Error messages don't expose sensitive information

## License

No license specified - all rights reserved.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Built with [Next.js](https://nextjs.org) and powered by [OpenAI](https://openai.com).
