import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { createRun } from '../features/runs/mockApi'
import { formatDateInput } from '../lib/format'

const pairOptions = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'XAUUSD',
] as const

const timeframeOptions = ['M15', 'H1', 'H4', 'D1'] as const
const strategyOptions = ['momentum', 'mean_reversion', 'breakout'] as const

const runSchema = z
  .object({
    endDate: z.string().min(1, 'End date is required'),
    pair: z.enum(pairOptions),
    riskPct: z
      .number({
        error: 'Risk % must be a number',
      })
      .min(0.1, 'Risk % must be at least 0.1')
      .max(2, 'Risk % cannot exceed 2.0'),
    startDate: z.string().min(1, 'Start date is required'),
    strategy: z.enum(strategyOptions),
    timeframe: z.enum(timeframeOptions),
  })
  .superRefine((data, context) => {
    const startDate = Date.parse(data.startDate)
    const endDate = Date.parse(data.endDate)

    if (Number.isNaN(startDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date is invalid',
        path: ['startDate'],
      })
    }

    if (Number.isNaN(endDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is invalid',
        path: ['endDate'],
      })
    }

    if (!Number.isNaN(startDate) && !Number.isNaN(endDate) && endDate <= startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['endDate'],
      })
    }
  })

type RunFormData = z.infer<typeof runSchema>
type SubmitState = 'error' | 'idle' | 'submitting'

interface Preset {
  id: string
  label: string
  values: RunFormData
}

function daysAgo(referenceDate: Date, days: number): Date {
  const next = new Date(referenceDate)
  next.setDate(next.getDate() - days)
  return next
}

function yearsAgo(referenceDate: Date, years: number): Date {
  const next = new Date(referenceDate)
  next.setFullYear(next.getFullYear() - years)
  return next
}

function buildPresets(referenceDate: Date): Preset[] {
  const endDate = formatDateInput(referenceDate)

  return [
    {
      id: 'quick_demo',
      label: 'Quick Demo (H1, last 90d, 0.5%)',
      values: {
        endDate,
        pair: 'EURUSD',
        riskPct: 0.5,
        startDate: formatDateInput(daysAgo(referenceDate, 90)),
        strategy: 'breakout',
        timeframe: 'H1',
      },
    },
    {
      id: 'conservative',
      label: 'Conservative (D1, 2y, 0.25%)',
      values: {
        endDate,
        pair: 'USDCAD',
        riskPct: 0.25,
        startDate: formatDateInput(yearsAgo(referenceDate, 2)),
        strategy: 'momentum',
        timeframe: 'D1',
      },
    },
    {
      id: 'higher_activity',
      label: 'Higher Activity (M15, 60d, 0.5%)',
      values: {
        endDate,
        pair: 'GBPUSD',
        riskPct: 0.5,
        startDate: formatDateInput(daysAgo(referenceDate, 60)),
        strategy: 'breakout',
        timeframe: 'M15',
      },
    },
    {
      id: 'trend_focus',
      label: 'Trend Focus (H4, 1y, 0.5%, momentum)',
      values: {
        endDate,
        pair: 'USDJPY',
        riskPct: 0.5,
        startDate: formatDateInput(yearsAgo(referenceDate, 1)),
        strategy: 'momentum',
        timeframe: 'H4',
      },
    },
    {
      id: 'mean_reversion_test',
      label: 'Mean Reversion Test (H1, 180d, 0.5%)',
      values: {
        endDate,
        pair: 'AUDUSD',
        riskPct: 0.5,
        startDate: formatDateInput(daysAgo(referenceDate, 180)),
        strategy: 'mean_reversion',
        timeframe: 'H1',
      },
    },
    {
      id: 'usdcad_macro',
      label: 'USD/CAD Macro (H1, 1y, 0.5%)',
      values: {
        endDate,
        pair: 'USDCAD',
        riskPct: 0.5,
        startDate: formatDateInput(yearsAgo(referenceDate, 1)),
        strategy: 'breakout',
        timeframe: 'H1',
      },
    },
  ]
}

export function NewRunPage() {
  const navigate = useNavigate()
  const presets = useMemo(() => buildPresets(new Date()), [])
  const [selectedPreset, setSelectedPreset] = useState(presets[0]?.id ?? '')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState('')

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<RunFormData>({
    defaultValues: presets[0]?.values,
    resolver: zodResolver(runSchema),
  })

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((candidate) => candidate.id === presetId)

      setSelectedPreset(presetId)

      if (!preset) {
        return
      }

      const options = {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }

      setValue('pair', preset.values.pair, options)
      setValue('timeframe', preset.values.timeframe, options)
      setValue('startDate', preset.values.startDate, options)
      setValue('endDate', preset.values.endDate, options)
      setValue('riskPct', preset.values.riskPct, options)
      setValue('strategy', preset.values.strategy, options)
      setSubmitError('')
      setSubmitState('idle')
    },
    [presets, setValue],
  )

  const onSubmit = handleSubmit(async (values: RunFormData) => {
    setSubmitState('submitting')
    setSubmitError('')

    try {
      const createdRun = await createRun(values)
      navigate(`/runs/${createdRun.id}`)
    } catch (error) {
      setSubmitState('error')
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating the run.',
      )
    }
  })

  const isSubmitting = submitState === 'submitting'

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Configuration</p>
          <h2 className="page-title">New Run</h2>
          <p className="page-subtitle">
            Validated workflow with presets and mock run creation.
          </p>
        </div>
      </header>

      <Card subtitle="Fields are validated with zod before creation" title="Run Parameters">
        <form className="new-run-form" onSubmit={onSubmit}>
          <div className="new-run-form__preset">
            <Select
              label="Preset"
              onChange={(event) => {
                applyPreset(event.currentTarget.value)
              }}
              value={selectedPreset}
            >
              <option value="">Choose a preset</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </div>

          <Select
            disabled={isSubmitting}
            error={errors.pair?.message}
            label="Pair"
            {...register('pair')}
          >
            {pairOptions.map((pairOption) => (
              <option key={pairOption} value={pairOption}>
                {pairOption}
              </option>
            ))}
          </Select>

          <Select
            disabled={isSubmitting}
            error={errors.timeframe?.message}
            label="Timeframe"
            {...register('timeframe')}
          >
            {timeframeOptions.map((timeframeOption) => (
              <option key={timeframeOption} value={timeframeOption}>
                {timeframeOption}
              </option>
            ))}
          </Select>

          <Input
            disabled={isSubmitting}
            error={errors.startDate?.message}
            label="Start Date"
            type="date"
            {...register('startDate')}
          />

          <Input
            disabled={isSubmitting}
            error={errors.endDate?.message}
            label="End Date"
            type="date"
            {...register('endDate')}
          />

          <Input
            disabled={isSubmitting}
            error={errors.riskPct?.message}
            label="Risk %"
            max="2"
            min="0.1"
            step="0.05"
            type="number"
            {...register('riskPct', { valueAsNumber: true })}
          />

          <Select
            disabled={isSubmitting}
            error={errors.strategy?.message}
            label="Strategy"
            {...register('strategy')}
          >
            {strategyOptions.map((strategyOption) => (
              <option key={strategyOption} value={strategyOption}>
                {strategyOption}
              </option>
            ))}
          </Select>

          <div className="new-run-form__actions">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating...' : 'Create Run'}
            </Button>
            {isSubmitting ? (
              <span className="form-inline-note">Creating run in mock API...</span>
            ) : null}
          </div>

          {submitState === 'error' ? (
            <p className="form-inline-error" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  )
}
