const CategoryList = ({ categories }) => {
  // Verificar se categories existe
  if (!categories) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {categories.map(category => (
        <Link 
          key={category.id} 
          href={`/category/${category.slug}`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}; 