import type { Participant } from "@/typedefs/CsvTypes";
import { debounce } from "@solid-primitives/scheduled";
import { IdCard } from "lucide-solid"
import { createEffect, createSignal, For, Show, type Component } from "solid-js"
import { ExternalBarcodeReaderInput } from "../ExternalBarcodeReaderInput";
import { makePersisted, storageSync } from "@solid-primitives/storage";
import { Link } from "@tanstack/solid-router";
import { CHECKER_DISPLAY_MOST_RECENT } from "@/settings";
import { ParticipantCard } from "@/components/ParticipantCard";

export const ExternalBarcodeReaderMode: Component<{
  participants: Participant[],
  scans: string[],
  rejects: string[],
  onScan: (id: string) => void
}> = (props) => {

  const mostRecentScans = () => props.scans.slice(0, CHECKER_DISPLAY_MOST_RECENT)
  const mostRecentRejects = () => props.rejects.slice(0, CHECKER_DISPLAY_MOST_RECENT)
  createEffect(() => {
    console.log(mostRecentScans())
  })

  const mostRecentScansDetails: () => Participant[] = () => mostRecentScans().map(id => props.participants.find(entry => entry.registrationId === id)!)

  return (
    <div class="container mx-auto flex flex-col items-center pt-4 gap-4">
      <h1 class="text-3xl">名札の存在確認</h1>

      <ExternalBarcodeReaderInput
        onInput={(t) => props.onScan(t)}
      />

      <Link class="btn btn-primary" to={"/nametag-checker/results" as never}>状況確認</Link>

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
  )
}