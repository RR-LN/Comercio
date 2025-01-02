'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <main className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Bem-vindo à nossa loja</h1>
          <p className="text-muted-foreground">Encontre os melhores produtos com os melhores preços</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Produto 1</CardTitle>
              <CardDescription>Descrição do produto 1</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ver detalhes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produto 2</CardTitle>
              <CardDescription>Descrição do produto 2</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ver detalhes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produto 3</CardTitle>
              <CardDescription>Descrição do produto 3</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ver detalhes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
