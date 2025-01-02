'use client'

import { useForm, Controller } from 'react-hook-form'
import {
  Grid,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material'
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material'

interface PaymentFormData {
  method: 'credit_card' | 'debit_card' | 'pix' | 'bank_slip'
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvv?: string
}

interface PaymentFormProps {
  initialData: PaymentFormData
  onSubmit: (data: PaymentFormData) => void
}

export default function PaymentForm({ initialData, onSubmit }: PaymentFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: initialData,
  })

  const paymentMethod = watch('method')

  const onFormSubmit = (data: PaymentFormData) => {
    onSubmit(data)
  }

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
  }

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        Forma de Pagamento
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="method"
            control={control}
            rules={{ required: 'Selecione uma forma de pagamento' }}
            render={({ field }) => (
              <FormControl component="fieldset">
                <RadioGroup {...field} row>
                  <FormControlLabel
                    value="credit_card"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCardIcon />
                        <span>Cartão de Crédito</span>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="pix"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCodeIcon />
                        <span>PIX</span>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="bank_slip"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BankIcon />
                        <span>Boleto</span>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            )}
          />
        </Grid>

        {paymentMethod === 'credit_card' && (
          <>
            <Grid item xs={12}>
              <Controller
                name="cardNumber"
                control={control}
                rules={{ 
                  required: 'Número do cartão é obrigatório',
                  pattern: {
                    value: /^(\d{4}\s?){4}$/,
                    message: 'Número do cartão inválido'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número do Cartão"
                    fullWidth
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber?.message}
                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                    inputProps={{ maxLength: 19 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="cardName"
                control={control}
                rules={{ required: 'Nome no cartão é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome no Cartão"
                    fullWidth
                    error={!!errors.cardName}
                    helperText={errors.cardName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="cardExpiry"
                control={control}
                rules={{ 
                  required: 'Data de validade é obrigatória',
                  pattern: {
                    value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                    message: 'Data inválida (MM/AA)'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Validade"
                    fullWidth
                    error={!!errors.cardExpiry}
                    helperText={errors.cardExpiry?.message}
                    onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                    inputProps={{ maxLength: 5 }}
                    placeholder="MM/AA"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="cardCvv"
                control={control}
                rules={{ 
                  required: 'CVV é obrigatório',
                  pattern: {
                    value: /^[0-9]{3,4}$/,
                    message: 'CVV inválido'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CVV"
                    fullWidth
                    error={!!errors.cardCvv}
                    helperText={errors.cardCvv?.message}
                    inputProps={{ maxLength: 4 }}
                  />
                )}
              />
            </Grid>
          </>
        )}

        {paymentMethod === 'pix' && (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" align="center">
              Você receberá um QR Code para pagamento após confirmar o pedido
            </Typography>
          </Grid>
        )}

        {paymentMethod === 'bank_slip' && (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" align="center">
              O boleto será gerado após a confirmação do pedido
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            Continuar para Revisão
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}
