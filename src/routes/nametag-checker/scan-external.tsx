import { type Participant } from '@/typedefs/CsvTypes'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { createEffect, createResource, createSignal, For, Show } from 'solid-js'
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { LOCALSTORAGE_PARTICIPANTS, LOCALSTORAGE_SCANS, LOCALSTORAGE_REJECTS, CHECKER_DISPLAY_MOST_RECENT } from '@/settings';
import { ExternalBarcodeReaderInput } from '@/components/ExternalBarcodeReaderInput';
import { ParticipantCard } from '@/components/ParticipantCard';


export const Route = createFileRoute('/nametag-checker/scan-external')({
  component: ScanExternalPage,
})


// Scan via external barcode reader page
function ScanExternalPage() {


  const [participantsList, _, participantsInit] = makePersisted(createSignal<Participant[]>([]), { name: LOCALSTORAGE_PARTICIPANTS, storage: localStorage, sync: storageSync });
  const [scanList, setScanList, scanListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_SCANS, storage: localStorage, sync: storageSync });
  const [rejectList, setRejectList, rejectListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_REJECTS, storage: localStorage, sync: storageSync });
  createResource(() => participantsInit)[0]();
  createResource(() => scanListInit)[0]();
  createResource(() => rejectListInit)[0]();

  // Quick lookup list for IDs
  const participantIdsList = () => participantsList().map(entry => entry.registrationId)

  // Handle scanning from child views
  const onScan = (id: string) => {
    if (!participantIdsList().includes(id)) {
      // setRejectList([...rejectList(), id])
      setRejectList([...new Set([id, ...rejectList()])])
    } else {
      setScanList([...new Set([id, ...scanList()])])
    }
  }


  const mostRecentScans = () => scanList().slice(0, CHECKER_DISPLAY_MOST_RECENT)
  const mostRecentRejects = () => rejectList().slice(0, CHECKER_DISPLAY_MOST_RECENT)

  const mostRecentScansDetails: () => Participant[] = () => mostRecentScans().map(id => participantsList().find(entry => entry.registrationId === id)!)

  return (
    <div class="container mx-auto flex flex-col items-center pt-4 gap-4">
      <h1 class="text-3xl">名札の存在確認</h1>

      <ExternalBarcodeReaderInput
        onInput={(t) => onScan(t)}
      />

      <Link class="btn btn-primary" to={"/nametag-checker/results" as never}>進行確認</Link>

      <Show when={mostRecentScans().length > 0}>
        <p>最近スキャンされたID</p>
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
    </div>
  )
}
