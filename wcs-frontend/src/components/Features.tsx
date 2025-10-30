import { motion } from "framer-motion";
import { Database, Zap, Code, Search, Shield, Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find relevant content using AI-powered semantic similarity, not just keyword matching.",
    color: "text-primary",
  },
  {
    icon: Database,
    title: "Vector Database",
    description: "Powered by Qdrant Cloud for lightning-fast similarity searches across embedded content.",
    color: "text-accent",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Efficient tokenization and chunking with NLTK ensures quick processing of large websites.",
    color: "text-primary",
  },
  {
    icon: Code,
    title: "HTML Parsing",
    description: "Intelligent content extraction with BeautifulSoup, removing scripts and styles automatically.",
    color: "text-accent",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Built with Django REST Framework for robust API handling and data security.",
    color: "text-primary",
  },
  {
    icon: Gauge,
    title: "Token Control",
    description: "Optimized chunk sizes (≤500 tokens) for accurate results without overwhelming context.",
    color: "text-accent",
  },
];

export default function Features() {
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
            Powerful Features for Content Discovery
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to extract and search website content with precision and speed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card">
                <CardHeader>
                  <feature.icon className={`h-10 w-10 mb-4 ${feature.color}`} />
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
