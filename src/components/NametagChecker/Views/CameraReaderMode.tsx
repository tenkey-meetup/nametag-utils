import type { Participant } from "@/typedefs/CsvTypes";
import { debounce } from "@solid-primitives/scheduled";
import { IdCard } from "lucide-solid"
import { createEffect, createSignal, For, onMount, Show, type Component } from "solid-js"
import { ExternalBarcodeReaderInput } from "../ExternalBarcodeReaderInput";
import { makePersisted, storageSync } from "@solid-primitives/storage";
import { Link } from "@tanstack/solid-router";
import { CHECKER_DISPLAY_MOST_RECENT } from "@/settings";
import { CameraBarcodeReader } from "@/components/CameraBarcodeReader";
import { ParticipantCard } from "@/components/ParticipantCard";


export const CameraReaderMode: Component<{
  participants: Participant[],
  scans: string[],
  rejects: string[],
  onScan: (id: string) => void
}> = (props) => {


  const mostRecentScans = () => props.scans.slice(0, CHECKER_DISPLAY_MOST_RECENT)
  const mostRecentRejects = () => props.rejects.slice(0, CHECKER_DISPLAY_MOST_RECENT)
  const [barcodeScannerActive, setBarcodeScannerActive] = createSignal<boolean>(false)

  const mostRecentScansDetails: () => Participant[] = () => mostRecentScans().map(id => props.participants.find(entry => entry.registrationId === id)!)

  const onBarcodeReaderOutput = (id: string) => {
    console.log(id)
    setBarcodeScannerActive(false)
    props.onScan(id)
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
    <div class="relative w-full h-full flex-grow">
      <div class="absolute top-0 left-0 right-0 bottom-0 w-full h-full container mx-auto flex flex-col items-center pt-0 md:pt-4 gap-4">

        <CameraBarcodeReader
          activate={barcodeScannerActive()}
          onScan={onBarcodeReaderOutput}
        />

        <Show when={mostRecentScans().length > 0}>
          <p>最近スキャンされたID</p>
          <div class="flex flex-col gap-2 p-4 items-stretch w-full max-w-[500px]">
            <For each={mostRecentScansDetails()}>
              {(entry) =>
                <ParticipantCard participant={entry} />
              }
            </For>
          </div>
          <Show when={props.scans.length > CHECKER_DISPLAY_MOST_RECENT}>
            <p>+その他{props.scans.length - CHECKER_DISPLAY_MOST_RECENT}名</p>
          </Show>
        </Show>
      </div>

      <div class="absolute bottom-0 w-full flex flex-row items-center justify-center pb-2 gap-2 md:pb-4 md:gap-4">
        <Link class="btn btn-outline btn-accent btn-xl" to={"/nametag-checker/results"}>状況確認</Link>
        <button class={`btn btn-xl select-none ${barcodeScannerActive() ? "btn-secondary" : "btn-primary"}`}
          ref={scanButton}
          onMouseDown={(e) => { e.preventDefault(); setBarcodeScannerActive(true) }}
          onMouseUp={(e) => { e.preventDefault(); setBarcodeScannerActive(false) }}
        >
          スキャン
        </button>
      </div>
    </div>
  )
}