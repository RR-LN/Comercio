'use client'

import { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, ArrowRight, CreditCard, QrCode, Barcode } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface PaymentFormProps {
  amount: number
  onSubmit: (data: any) => void
  onBack: () => void
}

type PaymentMethod = 'credit_card' | 'pix' | 'bank_slip'

interface PaymentFormData {
  method: PaymentMethod
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvv?: string
  installments?: number
  cpf: string
}

const PaymentFormComponent = ({
  amount,
  onSubmit,
  onBack,
}: PaymentFormProps) => {
  const [showCvv, setShowCvv] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')

  const form = useForm<PaymentFormData>()

  const installmentOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    .map(number => ({
      value: number.toString(),
      label: number === 1
        ? `À vista - ${formatCurrency(amount)}`
        : `${number}x de ${formatCurrency(amount / number)} sem juros`
    }))

  const renderPaymentMethodForm = () => {
    switch (paymentMethod) {
      case 'credit_card':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Cartão</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0000 0000 0000 0000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome no Cartão</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Como está impresso no cartão"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MM/AA"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardCvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showCvv ? 'text' : 'password'}
                          placeholder="123"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowCvv(!showCvv)}
                        >
                          {showCvv ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {installmentOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 'pix':
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-8 rounded-xl bg-muted">
              <QrCode className="h-32 w-32" />
            </div>
            <p className="text-muted-foreground text-center">
              Escaneie o QR Code com seu aplicativo de pagamento
            </p>
            <p className="text-sm text-muted-foreground text-center">
              O pagamento será confirmado automaticamente
            </p>
          </div>
        )

      case 'bank_slip':
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-8 rounded-xl bg-muted">
              <Barcode className="h-32 w-32" />
            </div>
            <p className="text-muted-foreground text-center">
              O boleto será gerado após a confirmação do pedido
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Prazo de vencimento: 3 dias úteis
            </p>
          </div>
        )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="credit_card"
                  id="credit_card"
                  className="peer sr-only"
                />
                <label
                  htmlFor="credit_card"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="mt-2">Cartão</span>
                </label>
              </div>

              <div>
                <RadioGroupItem
                  value="pix"
                  id="pix"
                  className="peer sr-only"
                />
                <label
                  htmlFor="pix"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <QrCode className="h-6 w-6" />
                  <span className="mt-2">PIX</span>
                </label>
              </div>

              <div>
                <RadioGroupItem
                  value="bank_slip"
                  id="bank_slip"
                  className="peer sr-only"
                />
                <label
                  htmlFor="bank_slip"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Barcode className="h-6 w-6" />
                  <span className="mt-2">Boleto</span>
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {renderPaymentMethodForm()}

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="000.000.000-00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button type="submit" className="gap-2">
            Finalizar Pedido
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}

export const PaymentForm = memo(PaymentFormComponent)
