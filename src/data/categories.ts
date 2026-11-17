import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'fruits', name: 'Fruits', emoji: '🍎', color: '#F0524F', bg: '#FFE4E1', level: 1, blurb: 'Sweet and juicy' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥕', color: '#F08A24', bg: '#FFEBD6', level: 1, blurb: 'Grow strong' },
  { id: 'animals', name: 'Animals', emoji: '🦁', color: '#E8A317', bg: '#FFF3CC', level: 1, blurb: 'Wild and tame' },
  { id: 'birds', name: 'Birds', emoji: '🐦', color: '#2FA4E7', bg: '#DDF1FD', level: 1, blurb: 'Up in the sky' },
  { id: 'insects', name: 'Insects', emoji: '🦋', color: '#8C5CE6', bg: '#EEE6FF', level: 2, blurb: 'Tiny creatures' },
  { id: 'sea', name: 'Sea Animals', emoji: '🐠', color: '#1BA8A0', bg: '#D7F5F2', level: 1, blurb: 'Under the waves' },
  { id: 'body', name: 'Body Parts', emoji: '👀', color: '#E25C8A', bg: '#FFE3EE', level: 1, blurb: 'All about me' },
  { id: 'colors', name: 'Colors', emoji: '🎨', color: '#D9468F', bg: '#FFE2F1', level: 1, blurb: 'A rainbow world' },
  { id: 'shapes', name: 'Shapes', emoji: '🔷', color: '#3D7BE0', bg: '#DFEAFF', level: 1, blurb: 'Round and pointy' },
  { id: 'numbers', name: 'Numbers', emoji: '🔢', color: '#4E62D8', bg: '#E2E6FF', level: 1, blurb: 'Count with me' },
  { id: 'alphabets', name: 'Alphabets', emoji: '🔤', color: '#C2410C', bg: '#FFE8DA', level: 1, blurb: 'A to Z' },
  { id: 'vehicles', name: 'Vehicles', emoji: '🚗', color: '#E0473B', bg: '#FFE1DE', level: 2, blurb: 'Zoom zoom!' },
  { id: 'household', name: 'Household Objects', emoji: '🛋️', color: '#9C6B3E', bg: '#F5E9DC', level: 2, blurb: 'Around the house' },
  { id: 'kitchen', name: 'Kitchen Items', emoji: '🍳', color: '#D97706', bg: '#FFF0D4', level: 2, blurb: 'Let’s cook' },
  { id: 'school', name: 'School Objects', emoji: '✏️', color: '#2B8A3E', bg: '#DDF5E2', level: 1, blurb: 'Ready for class' },
  { id: 'clothes', name: 'Clothes', emoji: '👕', color: '#3B82C4', bg: '#DCEBFA', level: 1, blurb: 'What to wear' },
  { id: 'food', name: 'Food and Drinks', emoji: '🍕', color: '#E8590C', bg: '#FFE6D5', level: 1, blurb: 'Yummy time' },
  { id: 'nature', name: 'Nature', emoji: '🌳', color: '#2F9E44', bg: '#DFF6E3', level: 2, blurb: 'The great outdoors' },
  { id: 'weather', name: 'Weather', emoji: '⛅', color: '#1C9BD6', bg: '#DBF1FC', level: 2, blurb: 'Sunny or rainy' },
  { id: 'occupations', name: 'Occupations', emoji: '👩‍⚕️', color: '#5F5BD8', bg: '#E5E4FF', level: 2, blurb: 'People who help' },
  { id: 'sports', name: 'Sports', emoji: '⚽', color: '#0E9F6E', bg: '#D6F6EA', level: 2, blurb: 'Let’s play' },
  { id: 'emotions', name: 'Emotions', emoji: '😊', color: '#E3A008', bg: '#FFF4CF', level: 3, blurb: 'How I feel' },
  { id: 'actions', name: 'Action Words', emoji: '🏃', color: '#DB2777', bg: '#FFE0EF', level: 3, blurb: 'Move and do' },
  { id: 'opposites', name: 'Opposite Words', emoji: '↔️', color: '#7C3AED', bg: '#EDE4FF', level: 3, blurb: 'Big and small' },
  { id: 'everyday', name: 'Everyday Objects', emoji: '🔑', color: '#0F7FA8', bg: '#D9F0F8', level: 1, blurb: 'Things we use' },
]

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)
