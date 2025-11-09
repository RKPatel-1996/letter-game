
import { LearningItem } from './types';

const generateItems = (
  chars: string,
  type: 'letter' | 'number' | 'special'
): LearningItem[] => {
  return chars.split('').map(char => ({
    id: `item-${char.toLowerCase()}`,
    value: char,
    type,
    status: 'not-practiced',
  }));
};

const specialCharsMap: { [key: string]: string } = {
  '!': 'exclamation',
  '@': 'at',
  '#': 'hash',
  '$': 'dollar',
  '%': 'percent',
  '?': 'question',
};

const generateSpecialItems = (chars: string): LearningItem[] => {
  return chars.split('').map(char => ({
    id: `item-${specialCharsMap[char]}`,
    value: char,
    type: 'special',
    status: 'not-practiced',
  }));
};

export const INITIAL_LEARNING_ITEMS: LearningItem[] = [
  ...generateItems('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'letter'),
  ...generateItems('0123456789', 'number'),
  ...generateSpecialItems('!@#$%?'),
];