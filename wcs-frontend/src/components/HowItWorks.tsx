import { motion } from "framer-motion";
import { Globe, Scissors, Database, Search } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Fetch HTML",
    description: "The backend fetches HTML content from your provided URL and removes unnecessary scripts and styles.",
    step: "01",
  },
  {
    icon: Scissors,
    title: "Tokenize & Chunk",
    description: "Text is tokenized using NLTK and split into manageable chunks of ≤500 tokens for optimal processing.",
    step: "02",
  },
  {
    icon: Database,
    title: "Generate Embeddings",
    description: "Each chunk is encoded into vectors using Sentence Transformers and stored in Qdrant Cloud.",
    step: "03",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Your query is vectorized and compared against stored embeddings to find the top 10 most relevant results.",
    step: "04",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A streamlined process from content extraction to intelligent search results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-full hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {step.step}
                </div>
                <step.icon className="h-12 w-12 text-primary mb-4 mt-2" />
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
