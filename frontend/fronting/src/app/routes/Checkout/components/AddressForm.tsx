'use client'

import { useForm, Controller } from 'react-hook-form'
import {
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material'
import { brazilianStates } from '@/utils/constants'

interface AddressFormData {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface AddressFormProps {
  initialData: AddressFormData
  onSubmit: (data: AddressFormData) => void
}

export default function AddressForm({ initialData, onSubmit }: AddressFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    defaultValues: initialData,
  })

  const onFormSubmit = (data: AddressFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        Endereço de Entrega
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="zipCode"
            control={control}
            rules={{ required: 'CEP é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="CEP"
                fullWidth
                error={!!errors.zipCode}
                helperText={errors.zipCode?.message}
                inputProps={{ maxLength: 9 }}
                placeholder="00000-000"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="street"
            control={control}
            rules={{ required: 'Rua é obrigatória' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Rua"
                fullWidth
                error={!!errors.street}
                helperText={errors.street?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="number"
            control={control}
            rules={{ required: 'Número é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Número"
                fullWidth
                error={!!errors.number}
                helperText={errors.number?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="complement"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Complemento"
                fullWidth
                placeholder="Opcional"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="neighborhood"
            control={control}
            rules={{ required: 'Bairro é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Bairro"
                fullWidth
                error={!!errors.neighborhood}
                helperText={errors.neighborhood?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="city"
            control={control}
            rules={{ required: 'Cidade é obrigatória' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cidade"
                fullWidth
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.state}>
            <InputLabel>Estado</InputLabel>
            <Controller
              name="state"
              control={control}
              rules={{ required: 'Estado é obrigatório' }}
              render={({ field }) => (
                <Select {...field} label="Estado">
                  {brazilianStates.map((state) => (
                    <MenuItem key={state.value} value={state.value}>
                      {state.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            Continuar para Pagamento
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}
