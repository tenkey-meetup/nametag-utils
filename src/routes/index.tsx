import { createFileRoute, Link } from '@tanstack/solid-router'
import { TenkeyLogo } from '@/components/TenkeyLogo'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div class="text-center">
        <div class="flex flex-col items-center gap-12 bg-gray-800 w-full h-[calc(100dvh-65px)] flex-grow grow align-center justify-center text-white">
          <TenkeyLogo classes='w-[75dvw] md:w-[50dvw] lg:w-[25dvw]' />
          <p class="text-4xl">スタッフ用ツール</p>
          <div class="flex flex-row gap-4">
            <Link class="btn btn-primary" to={"/nametag-checker"}>名札の存在確認</Link>
          </div>
        </div>
    </div>
  )
}
