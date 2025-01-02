'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextData {
  user: User | null
  signIn: () => void
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setUser({
        id: '1',
        name: 'John Doe',
        email,
      })
      
      setIsOpen(false)
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!'
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: 'Verifique suas credenciais e tente novamente'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const signOut = useCallback(() => {
    setUser(null)
    toast({
      title: 'Logout realizado',
      description: 'Até logo!'
    })
  }, [toast])

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn: () => setIsOpen(true),
        signOut,
        isLoading,
      }}
    >
      {children}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSignIn(
                formData.get('email') as string,
                formData.get('password') as string
              )
            }}
          >
            <Input
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Sua senha"
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Entrar
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{' '}
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => {
                  // Adicionar lógica de cadastro
                }}
              >
                Cadastre-se
              </Button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
