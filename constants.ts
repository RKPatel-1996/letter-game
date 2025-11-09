
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
    audioSrc: `/audio/${char.toLowerCase()}.mp3`,
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
    audioSrc: `/audio/${specialCharsMap[char]}.mp3`,
  }));
};

export const INITIAL_LEARNING_ITEMS: LearningItem[] = [
  ...generateItems('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'letter'),
  ...generateItems('0123456789', 'number'),
  ...generateSpecialItems('!@#$%?'),
];
