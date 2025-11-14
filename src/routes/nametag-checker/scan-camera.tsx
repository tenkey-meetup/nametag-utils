import { type Participant } from '@/typedefs/CsvTypes'
import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createEffect, createResource, createSignal, For, onMount, Show } from 'solid-js'
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { LOCALSTORAGE_PARTICIPANTS, LOCALSTORAGE_SCANS, LOCALSTORAGE_REJECTS, CHECKER_DISPLAY_MOST_RECENT } from '@/settings';
import { CameraBarcodeReader } from '@/components/CameraBarcodeReader';
import { ParticipantCard } from '@/components/ParticipantCard';
import { GenericBlankCard } from '@/components/GenericBlankCard';


export const Route = createFileRoute('/nametag-checker/scan-camera')({
  component: ScanCameraPage,
})


// Scan via phone camera page
function ScanCameraPage() {
  const [participantsList, setParticipantsList, participantsInit] = makePersisted(createSignal<Participant[]>([]), { name: LOCALSTORAGE_PARTICIPANTS, storage: localStorage, sync: storageSync });
  const [scanList, setScanList, scanListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_SCANS, storage: localStorage, sync: storageSync });
  const [rejectList, setRejectList, rejectListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_REJECTS, storage: localStorage, sync: storageSync });
  createResource(() => participantsInit)[0]();
  createResource(() => scanListInit)[0]();
  createResource(() => rejectListInit)[0]();

  const mostRecentScans = () => scanList().slice(0, CHECKER_DISPLAY_MOST_RECENT)
  const mostRecentRejects = () => rejectList().slice(0, CHECKER_DISPLAY_MOST_RECENT)
  const [barcodeScannerActive, setBarcodeScannerActive] = createSignal<boolean>(false)
  const mostRecentScansDetails: () => Participant[] = () => mostRecentScans().map(id => participantsList().find(entry => entry.registrationId === id)!)

  const navigate = useNavigate()

  // Prevent navigating in if participantsList is empty
  createEffect(() => {
    if (participantsList().length === 0) {
      navigate({ to: '/nametag-checker' })
    }
  })

  // Quick lookup list for IDs
  const participantIdsList = () => participantsList().map(entry => entry.registrationId)

  // Handle scanning
  const onScan = (id: string) => {
    setBarcodeScannerActive(false)
    if (id === "") { return }
    if (!participantIdsList().includes(id)) {
      // setRejectList([...rejectList(), id])
      setRejectList([...new Set([id, ...rejectList()])])
    } else {
      setScanList([...new Set([id, ...scanList()])])
    }
  }

  // Explicitly define touch inputs on scan button as non-passive to prevent haptic feedback on longpress
  let scanButton!: HTMLButtonElement;
  onMount(() => {
    scanButton.addEventListener("contextmenu", (e) => {
      e.preventDefault()
      e.stopPropagation()
    }, { passive: false })
    scanButton.addEventListener("touchstart", (e) => {
      e.preventDefault()
      e.stopPropagation()
      setBarcodeScannerActive(true)
    }, { passive: false })
    scanButton.addEventListener("touchend", (e) => {
      e.preventDefault()
      e.stopPropagation()
      setBarcodeScannerActive(false)
    }, { passive: false })
  })


  return (
    <>
      <div class="w-full h-full container mx-auto flex flex-col items-center pt-0 md:pt-4 gap-4 pb-10">

        <CameraBarcodeReader
          activate={barcodeScannerActive()}
          onScan={onScan}
        />

        <Show when={mostRecentScans().length > 0}>

          <p class="mt-8 text-lg">最近スキャンされたID</p>
          <div class="flex flex-col gap-2 p-4 items-stretch w-full max-w-[500px]">
            <For each={mostRecentScansDetails()}>
              {(entry) =>
                <ParticipantCard participant={entry} />
              }
            </For>
          </div>
          <Show when={scanList().length > CHECKER_DISPLAY_MOST_RECENT}>
            <p>+その他{scanList().length - CHECKER_DISPLAY_MOST_RECENT}名</p>
          </Show>
        </Show>

        <Show when={mostRecentScans().length > 0}>
          <p class="mt-8 text-lg">スキャンされた参加者リストに存在しないID</p>
          <div class="flex flex-col gap-2 p-4 items-stretch w-full max-w-[500px]">
            <For each={mostRecentRejects()}>
              {(entry) =>
                <GenericBlankCard>
                  <h2 class="font-semibold text-xl text-red-700">{entry}</h2>
                </GenericBlankCard>
              }
            </For>
          </div>
          <Show when={rejectList().length > CHECKER_DISPLAY_MOST_RECENT}>
            <p>+その他{rejectList().length - CHECKER_DISPLAY_MOST_RECENT}名</p>
          </Show>
        </Show>
      </div>
      <div class="fixed bottom-0 w-full flex flex-row items-center justify-center py-2 gap-2 md:py-4 md:gap-4 bg-white">
        <Link class="btn btn-outline btn-accent btn-xl" to={"/nametag-checker/results"}>進行確認</Link>
        <button class={`btn btn-xl select-none ${barcodeScannerActive() ? "btn-secondary" : "btn-primary"}`}
          ref={scanButton}
          onMouseDown={(e) => { e.preventDefault(); setBarcodeScannerActive(true) }}
          onMouseUp={(e) => { e.preventDefault(); setBarcodeScannerActive(false) }}
        >
          スキャン
        </button>
      </div>

    </>
  )
}
