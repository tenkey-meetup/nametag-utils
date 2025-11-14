import { createFileRoute, Link } from '@tanstack/solid-router'
import { TenkeyLogo } from '@/components/TenkeyLogo'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div class="text-center">
      <header class="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white text-[calc(10px+2vmin)]">
        <div class="flex flex-col items-center gap-12">
          <TenkeyLogo classes='w-[75dvw] md:w-[50dvw] lg:w-[25dvw]' />
          <div class="flex flex-row gap-4">
            <Link class="btn btn-primary" to={"/nametag-checker"}>名札の存在確認</Link>
          </div>
        </div>
      </header>
    </div>
  )
}
