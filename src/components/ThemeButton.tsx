import { store, STORE_KEYS } from '../store/store'
import { SunIcon } from './icons/SunIcon'

const THEMES = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Cupcake', value: 'cupcake' },
  { name: 'Bumblebee', value: 'bumblebee' },
  { name: 'Emerald', value: 'emerald' },
  { name: 'Corporate', value: 'corporate' },
  { name: 'Synthwave', value: 'synthwave' },
  { name: 'Retro', value: 'retro' },
  { name: 'Cyberpunk', value: 'cyberpunk' },
  { name: 'Valentine', value: 'valentine' },
  { name: 'Halloween', value: 'halloween' },
  { name: 'Garden', value: 'garden' },
  { name: 'Forest', value: 'forest' },
  { name: 'Aqua', value: 'aqua' },
  { name: 'Lofi', value: 'lofi' },
  { name: 'Pastel', value: 'pastel' },
  { name: 'Fantasy', value: 'fantasy' },
  { name: 'Wireframe', value: 'wireframe' },
  { name: 'Black', value: 'black' },
  { name: 'Luxury', value: 'luxury' },
  { name: 'Dracula', value: 'dracula' },
  { name: 'Cmyk', value: 'cmyk' },
  { name: 'Autumn', value: 'autumn' },
  { name: 'Business', value: 'business' },
  { name: 'Acid', value: 'acid' },
  { name: 'Lemonade', value: 'lemonade' },
  { name: 'Night', value: 'night' },
  { name: 'Coffee', value: 'coffee' },
  { name: 'Winter', value: 'winter' },
  { name: 'Dim', value: 'dim' },
  { name: 'Nord', value: 'nord' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Caramellatte', value: 'caramellatte' },
  { name: 'Abyss', value: 'abyss' },
  { name: 'Silk', value: 'silk' }
]

export const ThemeButton = () => {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-circle btn-ghost size-8 p-1">
        <SunIcon />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl max-h-[min(50vh,_500px)] overflow-auto"
      >
        {THEMES.map((theme) => (
          <li key={theme.value}>
            <input
              onClick={async () => {
                document.querySelector('html')?.setAttribute('data-theme', theme.value)
                await store.set(STORE_KEYS.THEME, theme.value)
              }}
              type="radio"
              name="theme-dropdown"
              className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
              aria-label={theme.name}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
