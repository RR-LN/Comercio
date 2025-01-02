import Link from 'next/link';

// Correto:
<Link href="/products">Produtos</Link>

// Incorreto:
<Link href={undefined}>Produtos</Link> 