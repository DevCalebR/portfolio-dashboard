import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

const runSchema = z
  .object({
    endDate: z.string().min(1, 'End date is required'),
    pair: z.string().min(1, 'Pair is required'),
    startDate: z.string().min(1, 'Start date is required'),
    timeframe: z.string().min(1, 'Timeframe is required'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

type RunFormData = z.infer<typeof runSchema>
type SubmitState = 'error' | 'idle' | 'submitting' | 'success'

async function mockSubmit(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 450)
  })
}

export function NewRunPage() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<RunFormData>({
    defaultValues: {
      endDate: '',
      pair: 'USD/CAD',
      startDate: '',
      timeframe: '',
    },
    resolver: zodResolver(runSchema),
  })

  const onSubmit = handleSubmit(async () => {
    setSubmitState('submitting')

    try {
      await mockSubmit()
      setSubmitState('success')
      reset({
        endDate: '',
        pair: 'USD/CAD',
        startDate: '',
        timeframe: '',
      })
    } catch {
      setSubmitState('error')
    }
  })

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Configuration</p>
          <h2 className="page-title">New Run</h2>
          <p className="page-subtitle">
            Skeleton form with validation using react-hook-form + zod.
          </p>
        </div>
      </header>

      <Card title="Run Parameters">
        <form className="new-run-form" onSubmit={onSubmit}>
          <Input
            error={errors.pair?.message}
            label="Pair"
            placeholder="USD/CAD"
            {...register('pair')}
          />

          <Select
            error={errors.timeframe?.message}
            label="Timeframe"
            {...register('timeframe')}
          >
            <option value="">Select timeframe</option>
            <option value="M15">M15</option>
            <option value="M30">M30</option>
            <option value="H1">H1</option>
            <option value="H4">H4</option>
            <option value="D1">D1</option>
          </Select>

          <Input
            error={errors.startDate?.message}
            label="Start Date"
            type="date"
            {...register('startDate')}
          />

          <Input
            error={errors.endDate?.message}
            label="End Date"
            type="date"
            {...register('endDate')}
          />

          <div className="new-run-form__actions">
            <Button disabled={submitState === 'submitting'} type="submit">
              {submitState === 'submitting' ? 'Submitting...' : 'Save Draft'}
            </Button>
          </div>
        </form>
      </Card>

      {submitState === 'success' ? (
        <Card className="state-card" title="Draft saved">
          <p className="state-text">
            Loading state and success feedback are wired for future API calls.
          </p>
        </Card>
      ) : null}

      {submitState === 'error' ? (
        <Card className="state-card" title="Unable to save draft">
          <p className="state-text">Please retry after checking form values.</p>
        </Card>
      ) : null}
    </div>
  )
}
