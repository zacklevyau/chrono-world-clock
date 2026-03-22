import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ClockTile } from './ClockTile'
import type { FavouriteLocation } from '../types'
import type { WeatherInfo } from '../hooks/useWeather'

interface SortableClockTileProps {
  location: FavouriteLocation
  displayTime: Date
  onRemove: (id: string) => void
  isWarpMode: boolean
  onSelectForWarp: (id: string) => void
  isAnchor: boolean
  showSeconds: boolean
  weather?: WeatherInfo
}

export function SortableClockTile(props: SortableClockTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.location.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ClockTile {...props} dragListeners={listeners} />
    </div>
  )
}
