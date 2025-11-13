import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'

import styleCss from '../styles.css?url'
import { Navbar } from '@/components/Navbar'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: styleCss }],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <>
      <HeadContent />

      <div class="w-[100vw] min-h-[100dvh] flex flex-col gap-0">

        <div>
          <Navbar
            navbarItems={[
              { label: "名札の存在確認", path: "/nametag-checker" },
              { label: "参加者CSVの比較", path: "/csv-compare" }
            ]}
          />
        </div>

        <div class="flex flex-col flex-grow w-full h-full">
          <Outlet />
        </div>

      </div>

      <TanStackRouterDevtools />

      <Scripts />
    </>
  )
}
