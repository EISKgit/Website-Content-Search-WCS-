import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Zap, Database, Code, Settings, Rocket } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const sections = [
  {
    icon: BookOpen,
    title: "Overview",
    content: "Web Content Search is a single-page application that accepts a website URL and a search query, then returns the top 10 HTML DOM content chunks (≤500 tokens) most relevant to the query using semantic AI search.",
  },
  {
    icon: Zap,
    title: "Tech Stack",
    content: "Built with React + Vite + Tailwind + Framer Motion on the frontend, Django + DRF on the backend, Qdrant Cloud for vector storage, Sentence Transformers for embeddings, NLTK for tokenization, and BeautifulSoup4 for HTML parsing.",
  },
  {
    icon: Database,
    title: "Qdrant Cloud Setup",
    content: "Create a cluster on Qdrant Cloud, generate a Database API key, and add the cluster URL and API key to your environment variables. The system automatically creates collections and manages embeddings.",
  },
];

const backendCode = `# Create virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt')"

# Set environment variables
export QDRANT_URL="https://<your-cluster-url>:6333"
export QDRANT_API_KEY="<your-qdrant-api-key>"
export GROQ_API_KEY="<your-groq-api-key>"
export DJANGO_SECRET_KEY="xxx"

# Run Django
python manage.py migrate
python manage.py runserver`;

const frontendCode = `# Navigate to frontend directory
cd frontend

# Create .env file
echo "VITE_API_BASE=http://localhost:8000" > .env

# Install dependencies and start
npm install
npm run dev`;

export default function Docs() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know to set up and use Web Content Search.
          </p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                Backend Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SyntaxHighlighter
                language="bash"
                style={vscDarkPlus}
                customStyle={{
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                }}
              >
                {backendCode}
              </SyntaxHighlighter>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Code className="h-6 w-6 text-accent" />
                Frontend Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SyntaxHighlighter
                language="bash"
                style={vscDarkPlus}
                customStyle={{
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                }}
              >
                {frontendCode}
              </SyntaxHighlighter>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">1. Content Extraction</h4>
                  <p>The backend fetches HTML from the provided URL, removes scripts and styles using BeautifulSoup4.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">2. Tokenization</h4>
                  <p>Text is tokenized into ≤500-token chunks using NLTK for optimal processing.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3. Embedding Generation</h4>
                  <p>Chunks are encoded using Sentence Transformers (all-MiniLM-L6-v2 model).</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">4. Vector Storage</h4>
                  <p>Embeddings are upserted into a Qdrant collection for fast similarity search.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">5. Semantic Search</h4>
                  <p>Query is encoded and Qdrant performs similarity search to retrieve the top 10 most relevant chunks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
