import { mande, defaults } from 'mande'

export const jokes = mande('https://official-joke-api.appspot.com')
// jokes.options.a

// @ts-ignore
delete defaults.headers['Content-Type']

export interface Joke {
  id: number
  type: string
  setup: string
  punchline: string
}

export function getRandomJoke() {
  return jokes.get<Joke>('/jokes/random')
}
