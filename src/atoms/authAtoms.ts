import { atomWithStorage } from 'jotai/utils';

export const authorAtom = atomWithStorage<string>('chat-author', '', undefined, {
  getOnInit: true,
});
