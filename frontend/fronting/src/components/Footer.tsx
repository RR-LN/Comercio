'use client'

import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Informações da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Minha Loja</h3>
            <p className="text-sm text-muted-foreground">
              A melhor experiência em compras online. Qualidade e confiança em primeiro lugar.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Links Úteis</h4>
            <nav className="space-y-2">
              <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary block">
                Sobre Nós
              </Link>
              <Link href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-primary block">
                Política de Privacidade
              </Link>
              <Link href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-primary block">
                Termos de Uso
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary block">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@minhaloja.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Inscreva-se para receber nossas ofertas e novidades.
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Seu e-mail" />
              <Button>Inscrever</Button>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Minha Loja. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
