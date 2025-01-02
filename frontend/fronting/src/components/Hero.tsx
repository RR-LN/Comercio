import { motion } from 'framer-motion';

export function Hero() {
  return (
    <div className="relative h-[70vh] mb-12 overflow-hidden rounded-2xl">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 transform-gpu"
        style={{
          backgroundImage: 'url("/hero-image.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-center mb-6 max-w-4xl"
        >
          Descubra Produtos Incríveis
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-center max-w-2xl mb-8"
        >
          Explore nossa seleção exclusiva de produtos com os melhores preços
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <a href="/products" className="btn-primary">
            Explorar Produtos
          </a>
          <a href="/categories" className="btn-outline text-white border-white hover:bg-white/10">
            Ver Categorias
          </a>
        </motion.div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
