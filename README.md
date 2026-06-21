# AI Investment Committee

AI Investment Committee is a web application that analyzes a stock using multiple specialized AI agents. Instead of relying on a single response, the system follows a committee-style workflow where different agents evaluate the company from different perspectives before producing a final investment recommendation.

The goal of the project is to simulate a simplified investment committee process and demonstrate how multiple AI agents can collaborate to reach a decision.

## Project Overview

The application accepts a stock ticker symbol and performs a multi-stage analysis. Different agents are responsible for research, financial analysis, market sentiment evaluation, risk assessment, and final decision-making.

The final recommendation is categorized as:

* INVEST
* HOLD
* PASS

Each recommendation is supported by the reasoning generated throughout the analysis process.

## Workflow

### Stage 1: Information Gathering

Three independent agents collect information about the company:

* Research Analyst
* Financial Analyst
* News & Sentiment Analyst

### Stage 2: Debate

The findings from Stage 1 are reviewed by two agents with opposing viewpoints:

* Bull Analyst
* Bear Analyst

These agents generate arguments supporting and opposing an investment in the company.

### Stage 3: Risk Assessment

A Risk Officer reviews the available information and identifies potential concerns, uncertainties, and risk factors.

### Stage 4: Final Recommendation

The Portfolio Manager reviews all previous reports and produces the final investment recommendation.

## Technologies Used

* Next.js
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts
* Mistral API
* Alpha Vantage API
* jsPDF
| AI Orchestration | LangChain.js + LangGraph.js for multi-agent workflow management, using Mistral models (`mistral-small-latest` for analyst agents and `mistral-large-latest` for the final Portfolio Manager decision) |

## Main Features

* Multi-agent investment analysis workflow
* Company research and financial analysis
* News sentiment evaluation
* Bull and Bear argument generation
* Risk assessment module
* Final recommendation with explanation
* Interactive charts and visualizations
* PDF report generation
* Responsive user interface

## Installation

### Prerequisites

* Node.js 18 or later
* Mistral API Key
* Alpha Vantage API Key

### Clone Repository

```bash
git clone https://github.com/your-username/ai-investment-committee.git
cd ai-investment-committee
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MISTRAL_API_KEY=your_mistral_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
```

### Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## API Routes

### Run Full Committee

```http
POST /api/committee
```

Request Body:

```json
{
  "ticker": "MSFT"
}
```

### Individual Agent Endpoints

```http
POST /api/agents/research
POST /api/agents/financial
POST /api/agents/news
```

## Folder Structure

```text
src
├── app
│   ├── api
│   └── page.tsx
├── components
│   ├── committee
│   └── ui
├── lib
│   ├── agents
│   ├── api-clients
│   ├── mock
│   ├── pdf
│   └── types
```

## Limitations

* The free Alpha Vantage plan has request limits.
* Cached data is stored in memory and resets when the application restarts.
* Workflow progress is simulated on the frontend and is not streamed in real time.

## Future Improvements

* Real-time progress updates using Server-Sent Events.
* Persistent caching with Redis.
* Portfolio tracking and watchlist support.
* Historical performance analysis.
* Additional market data providers.

## License

MIT License
