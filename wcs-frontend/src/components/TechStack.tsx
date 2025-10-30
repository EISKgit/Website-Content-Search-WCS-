import { motion } from "framer-motion";

const technologies = [
  {
    category: "Frontend",
    items: [
      { name: "React", color: "from-cyan-500 to-blue-500" },
      { name: "Vite", color: "from-purple-500 to-pink-500" },
      { name: "Tailwind CSS", color: "from-cyan-400 to-blue-600" },
      { name: "Framer Motion", color: "from-purple-600 to-pink-600" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Django", color: "from-green-600 to-emerald-600" },
      { name: "Django REST Framework", color: "from-red-600 to-rose-600" },
      { name: "Python", color: "from-blue-500 to-blue-700" },
    ],
  },
  {
    category: "AI & Data",
    items: [
      { name: "Qdrant", color: "from-indigo-600 to-purple-600" },
      { name: "Sentence Transformers", color: "from-orange-500 to-amber-500" },
      { name: "NLTK", color: "from-teal-500 to-cyan-600" },
      { name: "BeautifulSoup4", color: "from-yellow-500 to-orange-500" },
      { name: "Groq (LLM)", color: "from-violet-600 to-purple-600" },
    ],
  },
];

export default function TechStack() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built with Modern Technologies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A powerful stack combining cutting-edge frontend frameworks with robust backend services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {technologies.map((tech, categoryIndex) => (
            <motion.div
              key={tech.category}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm"
            >
              <h3 className="text-xl font-bold mb-4 text-foreground">
                {tech.category}
              </h3>
              <div className="space-y-3">
                {tech.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: categoryIndex * 0.2 + index * 0.1 }}
                    className="group"
                  >
                    <div className={`bg-gradient-to-r ${item.color} p-3 rounded-lg text-white font-medium text-sm transition-transform group-hover:scale-105`}>
                      {item.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
