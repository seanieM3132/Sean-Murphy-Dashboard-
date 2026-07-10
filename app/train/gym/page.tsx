import type { Metadata } from 'next'
import GymPage from '@/components/gym/GymPage'

export const metadata: Metadata = {
  title: 'Gym \u00B7 Train',
}

export default function Page() {
  return <GymPage />
}
