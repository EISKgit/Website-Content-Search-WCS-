import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const backendSetup = `# Create virtual environment and install
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt')"

# Set environment variables
export QDRANT_URL="https://<your-cluster>:6333"
export QDRANT_API_KEY="<your-key>"
export GROQ_API_KEY="<your-key>"

# Run Django
python manage.py migrate
python manage.py runserver`;

const frontendSetup = `# Navigate to frontend
cd frontend

# Create .env file
echo "VITE_API_BASE=http://localhost:8000" > .env

# Install and run
npm install
npm run dev`;

export default function Quickstart() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quick Start Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get up and running in minutes with our simple setup process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Backend Setup</h3>
            </div>
            <SyntaxHighlighter
              language="bash"
              style={vscDarkPlus}
              customStyle={{
                borderRadius: "0.75rem",
                fontSize: "0.85rem",
                padding: "1rem",
              }}
            >
              {backendSetup}
            </SyntaxHighlighter>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-bold">Frontend Setup</h3>
            </div>
            <SyntaxHighlighter
              language="bash"
              style={vscDarkPlus}
              customStyle={{
                borderRadius: "0.75rem",
                fontSize: "0.85rem",
                padding: "1rem",
              }}
            >
              {frontendSetup}
            </SyntaxHighlighter>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
